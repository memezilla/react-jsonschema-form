import React from 'react';
import { Simulate } from 'react-testing-library';

function check(renderForm) {
  describe('ObjectField', () => {
    describe('schema', () => {
      const schema = {
        type: 'object',
        title: 'my object',
        description: 'my description',
        required: ['foo'],
        default: {
          foo: 'hey',
          bar: true
        },
        properties: {
          foo: {
            title: 'Foo',
            type: 'string'
          },
          bar: {
            type: 'boolean'
          }
        }
      };

      it('should render a fieldset', () => {
        const { node } = renderForm({ schema });

        expect(node.querySelectorAll('fieldset').length).toBe(1);
      });

      it('should render a fieldset legend', () => {
        const { node } = renderForm({ schema });

        const legend = node.querySelector('fieldset > legend');

        expect(legend.textContent).toEqual('my object');
        expect(legend.id).toEqual('root__title');
      });

      // TitleField was renamed to Title and now it's in templates
      it.skip('should render a customized title', () => {
        const CustomTitleField = ({ title }) => <div id="custom">{title}</div>;
        const { node } = renderForm({
          schema,
          fields: {
            TitleField: CustomTitleField
          }
        });

        expect(node.querySelector('fieldset > #custom').textContent).toEqual(
          'my object'
        );
      });

      // DescriptionField was renamed to Description and now it's in templates
      it.skip('should render a customized description', () => {
        const CustomDescriptionField = ({ description }) => (
          <div id="custom">{description}</div>
        );

        const { node } = renderForm({
          schema,
          fields: { DescriptionField: CustomDescriptionField }
        });
        expect(node.querySelector('fieldset > #custom').textContent).toEqual(
          'my description'
        );
      });

      it('should render a default property label', () => {
        const { node } = renderForm({ schema });

        expect(node.querySelector('.field-boolean label').textContent).toEqual(
          'bar'
        );
      });

      it('should render a string property', () => {
        const { node } = renderForm({ schema });

        expect(node.querySelectorAll('.field input[type=text]').length).toBe(1);
      });

      it('should render a boolean property', () => {
        const { node } = renderForm({ schema });

        expect(
          node.querySelectorAll('.field input[type=checkbox]').length
        ).toBe(1);
      });

      it('should handle a default object value', () => {
        const { node } = renderForm({ schema });

        expect(node.querySelector('.field input[type=text]').value).toEqual(
          'hey'
        );
        expect(
          node.querySelector('.field input[type=checkbox]').checked
        ).toEqual(true);
      });

      it('should handle required values', () => {
        const { node } = renderForm({ schema });

        // Required field is <input type="text" required="">
        expect(
          node.querySelector('input[type=text]').getAttribute('required')
        ).toEqual('');
        expect(node.querySelector('.field-string label').textContent).toEqual(
          'Foo*'
        );
      });

      it('should fill fields with form data', () => {
        const { node } = renderForm({
          schema,
          formData: {
            foo: 'hey',
            bar: true
          }
        });

        expect(node.querySelector('.field input[type=text]').value).toEqual(
          'hey'
        );
        expect(
          node.querySelector('.field input[type=checkbox]').checked
        ).toEqual(true);
      });

      it('should handle object fields change events', () => {
        const { getState, node } = renderForm({ schema });

        Simulate.change(node.querySelector('input[type=text]'), {
          target: { value: 'changed' }
        });

        expect(getState().formData.foo).toEqual('changed');
      });

      it('should handle object fields with blur events', () => {
        const onBlur = jest.fn();
        const { node } = renderForm({ schema, onBlur });

        const input = node.querySelector('input[type=text]');
        Simulate.blur(input, {
          target: { value: 'changed' }
        });

        expect(onBlur).toHaveBeenCalledWith(input.id);
      });

      it('should handle object fields with focus events', () => {
        const onFocus = jest.fn();
        const { node } = renderForm({ schema, onFocus });

        const input = node.querySelector('input[type=text]');
        Simulate.focus(input, {
          target: { value: 'changed' }
        });

        expect(onFocus).toHaveBeenCalledWith(input.id);
      });

      it('should render the widget with the expected id', () => {
        const { node } = renderForm({ schema });

        expect(node.querySelector('input[type=text]').id).toEqual('root_foo');
        expect(node.querySelector('input[type=checkbox]').id).toEqual(
          'root_bar'
        );
      });
    });

    describe('fields ordering', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' },
          baz: { type: 'string' },
          qux: { type: 'string' }
        }
      };

      it('should use provided order', () => {
        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['baz', 'qux', 'bar', 'foo']
          }
        });
        const labels = [].map.call(
          node.querySelectorAll('.field > label'),
          l => l.textContent
        );

        expect(labels).toEqual(['baz', 'qux', 'bar', 'foo']);
      });

      it('should insert unordered properties at wildcard position', () => {
        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['baz', '*', 'foo']
          }
        });
        const labels = [].map.call(
          node.querySelectorAll('.field > label'),
          l => l.textContent
        );

        expect(labels).toEqual(['baz', 'bar', 'qux', 'foo']);
      });

      it('should throw when order list contains an extraneous property', () => {
        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['baz', 'qux', 'bar', 'wut?', 'foo', 'huh?']
          }
        });

        expect(node.querySelector('.config-error').textContent).toMatch(
          /contains extraneous properties 'wut\?', 'huh\?'/
        );
      });

      it('should throw when order list misses an existing property', () => {
        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['baz', 'bar']
          }
        });

        expect(node.querySelector('.config-error').textContent).toMatch(
          /does not contain properties 'foo', 'qux'/
        );
      });

      it('should throw when more than one wildcard is present', () => {
        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['baz', '*', 'bar', '*']
          }
        });

        expect(node.querySelector('.config-error').textContent).toMatch(
          /contains more than one wildcard/
        );
      });

      it('should order referenced schema definitions', () => {
        const refSchema = {
          definitions: {
            testdef: { type: 'string' }
          },
          type: 'object',
          properties: {
            foo: { $ref: '#/definitions/testdef' },
            bar: { $ref: '#/definitions/testdef' }
          }
        };

        const { node } = renderForm({
          schema: refSchema,
          uiSchema: {
            'ui:order': ['bar', 'foo']
          }
        });
        const labels = [].map.call(
          node.querySelectorAll('.field > label'),
          l => l.textContent
        );

        expect(labels).toEqual(['bar', 'foo']);
      });

      it('should order referenced object schema definition properties', () => {
        const refSchema = {
          definitions: {
            testdef: {
              type: 'object',
              properties: {
                foo: { type: 'string' },
                bar: { type: 'string' }
              }
            }
          },
          type: 'object',
          properties: {
            root: { $ref: '#/definitions/testdef' }
          }
        };

        const { node } = renderForm({
          schema: refSchema,
          uiSchema: {
            root: {
              'ui:order': ['bar', 'foo']
            }
          }
        });
        const labels = [].map.call(
          node.querySelectorAll('.field > label'),
          l => l.textContent
        );

        expect(labels).toEqual(['bar', 'foo']);
      });

      it('should render the widget with the expected id', () => {
        const schema = {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            bar: { type: 'string' }
          }
        };

        const { node } = renderForm({
          schema,
          uiSchema: {
            'ui:order': ['bar', 'foo']
          }
        });

        const ids = [].map.call(
          node.querySelectorAll('input[type=text]'),
          node => node.id
        );
        expect(ids).toEqual(['root_bar', 'root_foo']);
      });
    });

    // TitleField was renamed to Title and now it's in templates
    describe.skip('Title', () => {
      const TitleField = props => <div id={`title-${props.title}`} />;

      const fields = { TitleField };

      it('should pass field name to TitleField if there is no title', () => {
        const schema = {
          type: 'object',
          properties: {
            object: {
              type: 'object',
              properties: {}
            }
          }
        };

        const { node } = renderForm({ schema, fields });
        expect(node.querySelector('#title-object')).not.toBeNull();
      });

      it('should pass schema title to TitleField', () => {
        const schema = {
          type: 'object',
          properties: {},
          title: 'test'
        };

        const { node } = renderForm({ schema, fields });
        expect(node.querySelector('#title-test')).not.toBeNull();
      });

      it('should pass empty schema title to TitleField', () => {
        const schema = {
          type: 'object',
          properties: {},
          title: ''
        };
        const { node } = renderForm({ schema, fields });
        expect(node.querySelector('#title-')).toBeNull();
      });
    });
  });
}

export default check;
