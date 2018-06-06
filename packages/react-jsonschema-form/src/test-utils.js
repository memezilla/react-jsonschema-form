/**
 * Test utils
 */

import React from 'react';
import { render } from 'react-testing-library';

import DefaultForm from './lib';

export function initRenderForm(Form = DefaultForm, baseProps = {}) {
  let state;

  /**
   * Spy state changes
   */
  baseProps.onChange = initSpyOnChange(baseProps.onChange);

  return (props, existingContainer) => {
    let output;
    const tools = render(<Form {...baseProps} {...props} />, existingContainer);

    output = tools;
    output.getState = getState;
    output.rerender = rerender;
    output.node = tools.container.firstChild;

    return output;

    function rerender(newProps) {
      return tools.rerender(<Form {...baseProps} {...newProps} />);
    }
  };

  function getState() {
    return state;
  }

  function initSpyOnChange(onChange) {
    if (onChange) {
      return _state => {
        onChange(_state);
        state = _state;
      };
    }
    return _state => (state = _state);
  }
}

export const renderForm = initRenderForm();

export const suppressLogs = (type, testCase) => {
  jest.spyOn(console, type);
  global.console[type].mockImplementation(() => {});
  testCase();
  global.console[type].mockRestore();
};
