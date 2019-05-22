import { Project, QueryOptions } from 'shared/entities';
import { BaseDco } from './dco-base';


export const projectDco = new BaseDco<Project, QueryOptions<Project>>('Project');