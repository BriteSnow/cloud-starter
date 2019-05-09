import * as alias from 'module-alias';
import { resolve, join } from 'path';

const distDir = resolve('./dist/');
alias.addAlias('common', join(distDir, 'services/common/src'));
alias.addAlias('shared', join(distDir, 'shared/src'));
//alias.addPath(projectDir + 'server/src');
