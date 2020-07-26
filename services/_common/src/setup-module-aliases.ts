import * as alias from 'module-alias';
import { join, resolve } from 'path';

const distDir = resolve('./dist/');
alias.addAlias('common', join(distDir, 'services/_common/src'));
alias.addAlias('shared', join(distDir, 'shared/src'));
