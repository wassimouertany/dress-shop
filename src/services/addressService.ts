import { Address, AddressDocument } from '../models/Address';

export type CreateAddressData = {
  region: string;
  city: string;
  street: string;
  postalCode: string;
  streetNumber: string;
};

export const getAddressesByUser = (userId: string): Promise<AddressDocument[]> =>
  Address.find({ user: userId }).sort('-createdAt').exec(); 

export const createAddress = (
  userId: string,
  data: CreateAddressData
): Promise<AddressDocument> =>
  Address.create({ user: userId, ...data });

export const deleteAddress = (
  addressId: string,
  userId: string
): Promise<AddressDocument | null> =>
  Address.findOneAndDelete({ _id: addressId, user: userId }).exec(); 