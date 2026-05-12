import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, String: SchemaString, Date: SchemaDate } = Schema.Types;

export enum StatusEnum {
  Shipped   = 'SHIPPED',
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
}

export interface LivraisonDocument extends Document {
  order:          Types.ObjectId;
  address:        Types.ObjectId;
  status:         string;
  trackingNumber: string;
  deliveredAt?:   Date;
}

const LivraisonSchema = new Schema(
  {
    order:          { type: ObjectId, ref: 'Order' },
    address:        { type: ObjectId, ref: 'Address' },
    status: {
      type:    SchemaString,
      enum:    ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'],
      default: 'SHIPPED',
    },
    trackingNumber: SchemaString,
    deliveredAt:    SchemaDate,
  },
  { timestamps: true }
);

// ─── OCL Constraints — implémentées comme hooks Mongoose ──────────────────
//
// inv TrackingNonVide :
//   self.trackingNumber <> null and self.trackingNumber <> ''
//
// inv StatutValide :
//   self.status = DeliveryEnum::SHIPPED or IN_TRANSIT or DELIVERED
//
// inv DateLivraisonCoherente :
//   self.status = DELIVERED implies self.deliveredAt <> null
//
// inv DateLivraisonNonFuture :
//   self.deliveredAt <> null implies self.deliveredAt <= Date::now()
//
// inv CommandeObligatoire :
//   self.order <> null
//
// pre StatutNonDelivre :
//   self.status <> DeliveryEnum::DELIVERED
//
// pre NouveauStatutDifferent :
//   newStatus <> self.status
//
// post StatutMisAJour :
//   self.status = newStatus
//
// post DateDefinie :
//   self.status = DELIVERED implies self.deliveredAt = Date::now()
// ──────────────────────────────────────────────────────────────────────────

LivraisonSchema.pre('save', function (this: LivraisonDocument, next) {  
  const VALID_STATUSES = Object.values(StatusEnum);

  // INV-1 : trackingNumber obligatoire et non vide
  if (!this.trackingNumber || this.trackingNumber.trim() === '') {
    return next(
      new Error(
        '[OCL INV-1 TrackingNonVide] trackingNumber must be defined and non-empty'
      )
    );
  }

  // INV-2 : status doit appartenir à StatusEnum
  if (!VALID_STATUSES.includes(this.status as StatusEnum)) {
    return next(
      new Error(
        `[OCL INV-2 StatutValide] Invalid status: '${this.status}'. ` +
        `Must be one of: ${VALID_STATUSES.join(', ')}`
      )
    );
  }

  // INV-3 : si DELIVERED → deliveredAt obligatoire
  if (this.status === StatusEnum.Delivered && !this.deliveredAt) {
    return next(
      new Error(
        '[OCL INV-3 DateLivraisonCoherente] deliveredAt must be set when status is DELIVERED'
      )
    );
  }

  // INV-4 : deliveredAt ne peut pas être dans le futur
  if (this.deliveredAt && this.deliveredAt > new Date()) {
    return next(
      new Error(
        '[OCL INV-4 DateLivraisonNonFuture] deliveredAt cannot be a future date'
      )
    );
  }

  // INV-5 : order obligatoire
  if (!this.order) {
    return next(
      new Error(
        '[OCL INV-5 CommandeObligatoire] A Livraison must be linked to an existing order'
      )
    );
  }

  next();
});

export const Livraison = model<LivraisonDocument>('Livraison', LivraisonSchema);