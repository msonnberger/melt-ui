import {
	addEventListener,
	builder,
	createElHelpers,
	executeCallbacks,
	getDirectionalKeys,
	kbd,
} from '$lib/internal/helpers';
import { getElemDirection } from '$lib/internal/helpers/locale';
import type { Defaults } from '$lib/internal/types';
import { derived, get, writable } from 'svelte/store';
import type { CreateRadioGroupArgs } from './types';

const defaults = {
	orientation: 'vertical',
	loop: true,
	disabled: false,
	required: false,
} satisfies Defaults<CreateRadioGroupArgs>;

type RadioGroupParts = 'item';
const { name, selector } = createElHelpers<RadioGroupParts>('radio-group');

export function createRadioGroup(args: CreateRadioGroupArgs = {}) {
	const withDefaults = { ...defaults, ...args };
	const options = writable({
		disabled: withDefaults.disabled,
		required: withDefaults.required,
		loop: withDefaults.loop,
		orientation: withDefaults.orientation,
	});
	const value = writable(withDefaults.value ?? null);

	const root = builder(name(), {
		stores: options,
		returned: ($options) => {
			return {
				role: 'radiogroup',
				'aria-required': $options.required,
				'data-orientation': $options.orientation,
			} as const;
		},
	});

	type RadioGroupItemArgs =
		| {
				value: string;
				disabled?: boolean;
		  }
		| string;
	const item = builder(name('item'), {
		stores: [options, value],
		returned: ([$options, $value]) => {
			return (args: RadioGroupItemArgs) => {
				const itemValue = typeof args === 'string' ? args : args.value;
				const argDisabled = typeof args === 'string' ? false : !!args.disabled;
				const disabled = $options.disabled || (argDisabled as boolean);

				const checked = $value === itemValue;

				return {
					disabled,
					'data-value': itemValue,
					'data-orientation': $options.orientation,
					'data-disabled': disabled ? true : undefined,
					'data-state': checked ? 'checked' : 'unchecked',
					'aria-checked': checked,
					type: 'button',
					role: 'radio',
					tabindex: $value === null ? 0 : checked ? 0 : -1,
				} as const;
			};
		},
		action: (node: HTMLElement) => {
			const unsub = executeCallbacks(
				addEventListener(node, 'click', () => {
					const disabled = node.dataset.disabled === 'true';
					const itemValue = node.dataset.value;
					if (disabled || itemValue === undefined) return;
					value.set(itemValue);
				}),
				addEventListener(node, 'focus', (e) => {
					const el = e.currentTarget as HTMLElement;
					el.click();
				}),
				addEventListener(node, 'keydown', (e) => {
					const $options = get(options);
					const el = e.currentTarget as HTMLElement;
					const root = el.closest(selector()) as HTMLElement;

					const items = Array.from(root.querySelectorAll(selector('item'))) as Array<HTMLElement>;
					const currentIndex = items.indexOf(el);

					const dir = getElemDirection(root);
					const { nextKey, prevKey } = getDirectionalKeys(dir, $options.orientation);

					if (e.key === nextKey) {
						e.preventDefault();
						const nextIndex = currentIndex + 1;
						if (nextIndex >= items.length) {
							if ($options.loop) {
								items[0].focus();
							}
						} else {
							items[nextIndex].focus();
						}
					} else if (e.key === prevKey) {
						e.preventDefault();
						const prevIndex = currentIndex - 1;
						if (prevIndex < 0) {
							if ($options.loop) {
								items[items.length - 1].focus();
							}
						} else {
							items[prevIndex].focus();
						}
					} else if (e.key === kbd.HOME) {
						e.preventDefault();
						items[0].focus();
					} else if (e.key === kbd.END) {
						e.preventDefault();
						items[items.length - 1].focus();
					}
				})
			);

			return {
				destroy: unsub,
			};
		},
	});

	const itemInput = derived([options, value], ([$options, $value]) => {
		return (args: RadioGroupItemArgs) => {
			const itemValue = typeof args === 'string' ? args : args.value;
			const argDisabled = typeof args === 'string' ? false : !!args.disabled;
			const disabled = $options.disabled || argDisabled;

			return {
				type: 'hidden',
				'aria-hidden': true,
				tabindex: -1,
				value: itemValue,
				checked: $value === itemValue,
				disabled,
			};
		};
	});

	const isChecked = derived(value, ($value) => {
		return (itemValue: string) => {
			return $value === itemValue;
		};
	});

	return {
		options,
		value,
		root,
		item,
		itemInput,
		isChecked,
	};
}
