import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export const LinkButton: Component<ComponentProps<'a'>> = (props) => {
  const [, rest] = splitProps(props, ['children']);
  return (
    <div class="flex justify-center py-10">
      <a class="rounded-md bg-sky-800 p-4 text-white" {...rest}>
        {props.children}
      </a>
    </div>
  );
};
