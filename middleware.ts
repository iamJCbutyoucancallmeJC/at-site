import { withPasswordProtect } from '@tommyvez/passfort/next';

export default withPasswordProtect({ protectAll: true });

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
