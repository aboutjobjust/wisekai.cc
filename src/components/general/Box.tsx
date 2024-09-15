import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

export const Box: Component<ComponentProps<'section'>> = (props) => {
  const [, rest] = splitProps(props, ['class', 'children']);
  return (
    <section
      class={twMerge(
        'rounded-md border border-gray-300 p-5 text-center shadow-md',
        props.class,
      )}
      {...rest}
    >
      {props.children}
    </section>
  );
};
