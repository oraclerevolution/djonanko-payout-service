import { QueryResponse } from 'src/helper/enums/QueryResponse.enum';

export interface CreateHistoriqueResultDto {
  historique: any;
  status: QueryResponse;
}
