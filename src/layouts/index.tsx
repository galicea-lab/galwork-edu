// punkt wejścia layoutu. Strony mogą podmienić powłokę przez
// `Page.getLayout` (przykład: strony rekrutacji, components/rekrutacja).
import type { ReactElement, ReactNode } from 'react';

import AppLayout from '@/layouts/app/AppLayout';

/** Domyślny layout stron: pasek boczny + górny pasek + treść. */
export const getAppLayout = (page: ReactElement): ReactNode => <AppLayout>{page}</AppLayout>;

export { AppLayout };
export default AppLayout;
