import type { FloatingConfig } from '$lib/internal/actions';
import type { createPopover } from './create';

export type CreatePopoverArgs = {
	positioning?: FloatingConfig;
	arrowSize?: number;
	open?: boolean;
};

export type CreatePopoverReturn = ReturnType<typeof createPopover>;
