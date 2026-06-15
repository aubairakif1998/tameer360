import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PLATFORM_ROUTE_KEY = 'isPlatformRoute';
export const PlatformRoute = () => SetMetadata(IS_PLATFORM_ROUTE_KEY, true);

export const IS_AUTH_ROUTE_KEY = 'isAuthRoute';
export const AuthRoute = () => SetMetadata(IS_AUTH_ROUTE_KEY, true);
