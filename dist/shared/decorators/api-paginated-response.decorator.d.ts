import { Type } from '@nestjs/common';
export declare const ApiPaginatedResponse: <TModel extends Type>(model: TModel) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
