import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import schemaZos from './schema_zos.json';
import uiSchemaZos from './uischema_zos.json';
import schemaKos from './schema_kos.json';
import uiSchemaKos from './uischema_kos.json';
import schemaUrlop from './schema_urlop.json';
import uiSchemaUrlop from './uischema_urlop.json';
import dataUrlop from './data_urlop.json';

export { schemaZos, uiSchemaZos, schemaKos, uiSchemaKos, schemaUrlop, uiSchemaUrlop, dataUrlop };

export interface FormFixture {
  key: string;
  label: string;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  data: Record<string, unknown>;
}

export const formFixtures: FormFixture[] = [
  {
    key: 'urlop',
    label: 'Wniosek o urlop (tabele, zagnieżdżenia, if/then)',
    schema: schemaUrlop as unknown as RJSFSchema,
    uiSchema: uiSchemaUrlop as UiSchema,
    data: dataUrlop as Record<string, unknown>,
  },
  {
    key: 'zos',
    label: 'Zaświadczenie o studiowaniu',
    schema: schemaZos as unknown as RJSFSchema,
    uiSchema: uiSchemaZos as UiSchema,
    data: {},
  },
  {
    key: 'kos',
    label: 'Karta obiegu świadectwa',
    schema: schemaKos as unknown as RJSFSchema,
    uiSchema: uiSchemaKos as UiSchema,
    data: {},
  },
];
