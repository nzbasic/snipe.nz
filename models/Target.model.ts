import { Schema, model } from 'mongoose';

export interface Target {
    dateBegin: number,
    dateEnd: number,
    targetId: number,
}

const schema = new Schema<Target>({
    dateBegin: Number,
    dateEnd: Number,
    targetId: Number
});

export const TargetModel = model<Target>('Target', schema);