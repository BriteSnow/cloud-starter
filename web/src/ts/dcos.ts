import { Project, QueryOptions } from 'shared/entities';
import { BaseDco } from './dco-base';


export const projectDso = new BaseDco<Project, QueryOptions<Project>>('Project');