import { User } from "../schema/types";

export interface IUser extends User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  department?: string;
  position?: string;
  workingHours?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPole {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  id: number;
  name: string;
  description: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  poleId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MyContext {
  user?: User;
}

export interface JwtPayload {
  userId: number;
  role: string;
}

export interface EmailData {
  firstName: string;
  lastName: string;
}
