import { Schema, model, Document, Types } from 'mongoose';
import type { OrderItemDocument } from './OrderItem';

const { ObjectId, Number: NumberType } = Schema.Types;

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items?: OrderItemDocument[];
  total: number;
  payment?: Types.ObjectId;
  livraison?: Types.ObjectId;
  address?: Types.ObjectId;

  // GRASP Creator — Order aggregates OrderItems, so it is
  // responsible for building them.
  buildOrderItems(
    cartItems: Array<{ product: Types.ObjectId | string; quantity: number }>
  ): Array<{ order: Types.ObjectId; product: Types.ObjectId | string; quantity: number }>;
}

/** OCL: context Order — inv TotalNonNeg: self.total >= 0; inv UserRequired: user defined */
const OrderSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: [true, 'OCL UserRequired: Order.user must be set'],
    },
    total: {
      type: NumberType,
      required: [true, 'OCL Order: total must be set when enforcing TotalNonNeg'],
      min: [0, 'OCL TotalNonNeg: Order.total must be >= 0'],
    },
    payment: {
      type: ObjectId,
      ref: 'Payment',
    },
    livraison: {
      type: ObjectId,
      ref: 'Livraison',
    },
    address: {
      type: ObjectId,
      ref: 'Address',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order',
  options: { sort: { createdAt: -1 } },
});

/* =====================================
 GRASP Creator — buildOrderItems
 OCL pre:  CartNotEmpty, QuantitiesValid
 OCL post: OrderLinked (each result row’s order = self)
 =====================================*/
OrderSchema.methods.buildOrderItems = function (
  cartItems: Array<{ product: Types.ObjectId | string; quantity: number }>
): Array<{ order: Types.ObjectId; product: Types.ObjectId | string; quantity: number }> {
  if (!cartItems.length) {
    throw new Error('OCL CartNotEmpty: cartItems must not be empty');
  }
  for (const i of cartItems) {
    if (typeof i.quantity !== 'number' || i.quantity < 1) {
      throw new Error('OCL QuantitiesValid: each cart item quantity must be >= 1');
    }
  }

  const selfId = this._id as Types.ObjectId;
  const result = cartItems.map((item) => ({
    order: selfId,
    product: item.product,
    quantity: item.quantity,
  }));

  for (const o of result) {
    if (!o.order.equals(selfId)) {
      throw new Error('OCL OrderLinked: each built row must reference this order');
    }
  }

  return result;
};

export const Order = model<OrderDocument>('Order', OrderSchema);