import { it, beforeEach, afterEach } from 'vitest';
import * as ReactDOMClient from 'react-dom/client';


export function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);

  return { container, root };
}


export async function renderWithVitest(component, { root }) {
  root.render(component);
  await waitForComponentToRender();
}


export function cleanup({ container }) {
  document.body.removeChild(container);
}


function waitForComponentToRender() {
  return new Promise(resolve => setTimeout(resolve, 0));
}


export async function renderReact(description, component, assertions) {
  let testState = {};

  beforeEach(() => {
    const { container, root } = setup()
    testState.container = container;
    testState.root = root;
  });

  it(description, async () => {
    await renderWithVitest(component, testState);
    assertions(testState);
  });

  afterEach(() => {
    cleanup(testState);
  });
}

export const waitForEffects = async (getEffects, wait) => {
  let effects = getEffects();
  const max_length = effects?.length;
  let completed = 0;

  if (max_length >= 1) {
    const timeout = () => (new Promise(completed => setTimeout(() => {
      let next_completed = 0;
      for (let effect of effects) {
        if (effect) next_completed++;
      }
      completed = next_completed;
      if (completed < max_length) timeout();
    }, wait || 5000)));
    return await timeout();
  }
};