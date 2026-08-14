import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY_METADATA = 'featureKey';

// Tags a route with the AiOperation key FeatureGuard should check against
// the Feature table for FREE-plan users of the caller's segment.
export const RequireFeature = (key: string) => SetMetadata(FEATURE_KEY_METADATA, key);
