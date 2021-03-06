import Result from "../../result"
import PostgresStorage from "../postgresStorage";
import {QueryConfig} from "pg";
import {TypeMappingT} from "../../types/import/typeMappingT";
import PostgresAdapter from "../adapters/postgres/postgres";

/*
* ImportAdapterStorage encompasses all logic dealing with the manipulation of the Import Adapter
* class in a data storage layer.
*/
export default class TypeMappingStorage extends PostgresStorage{
    public static tableName = "data_type_mappings";

    private static instance: TypeMappingStorage;

    public static get Instance(): TypeMappingStorage {
        if(!TypeMappingStorage.instance) {
            TypeMappingStorage.instance = new TypeMappingStorage()
        }

        return TypeMappingStorage.instance
    }

    public async Create(containerID:string, dataSourceID:string, shapeHash: string, samplePayload: any): Promise<Result<TypeMappingT>> {
        const t = {
            id: super.generateUUID(),
            sample_payload: samplePayload,
            container_id: containerID,
            data_source_id: dataSourceID,
            shape_hash: shapeHash,
            active: false
        }


        const r = await super.runAsTransaction(TypeMappingStorage.createStatement(t as TypeMappingT))
        if(r.isError) {
            return new Promise(resolve => resolve(Result.Pass(r)))
        }

        return new Promise(resolve => resolve(Result.Success(t as TypeMappingT)))
    }

    // Update partially updates the exports. This function will allow you to
    // rewrite foreign keys - this is by design. The storage layer is dumb, whatever
    // uses the storage layer should be what enforces user privileges etc.
    public async Update(id: string, userID: string, updatedField: {[key:string]: any}): Promise<Result<boolean>> {
        const toUpdate = await this.Retrieve(id);

        if(toUpdate.isError) {
            return new Promise(resolve => resolve(Result.Failure(toUpdate.error!.error)))
        }

        const updateStatement:string[] = [];
        const values:string[] = [];
        let i = 1;

        Object.keys(updatedField).map(k => {
            updateStatement.push(`${k} = $${i}`);
            values.push(updatedField[k]);
            i++
        });

        return new Promise(resolve => {
            PostgresAdapter.Instance.Pool.query({
                text: `UPDATE data_type_mappings SET ${updateStatement.join(",")} WHERE id = '${id}'`,
                values
            })
                .then(() => {
                    resolve(Result.Success(true))
                })
                .catch(e => resolve(Result.Failure(e)))
        })
    }

    public Retrieve(id: string): Promise<Result<TypeMappingT>> {
        return super.retrieve<TypeMappingT>(TypeMappingStorage.retrieveStatement(id))
    }

    // since the combination shape hash, data source, and container are a unique set
    // we can confidently request a single object
    public RetrieveByShapeHash(dataSourceID: string, shapeHash: string): Promise<Result<TypeMappingT>> {
        return super.retrieve<TypeMappingT>(TypeMappingStorage.retrieveByShapeHashStatement(dataSourceID, shapeHash))
    }

    public List(containerID: string, dataSourceID: string, offset: number, limit: number, sortBy?:string, sortDesc?: boolean): Promise<Result<TypeMappingT[]>> {
        if(limit === -1) {
            return super.rows<TypeMappingT>(TypeMappingStorage.listAllStatement(containerID, dataSourceID))
        }

        return super.rows<TypeMappingT>(TypeMappingStorage.listStatement(containerID, dataSourceID, offset, limit, sortBy, sortDesc))
    }

    public ListNoTransformations(containerID: string, dataSourceID: string, offset: number, limit: number, sortBy?:string, sortDesc?: boolean): Promise<Result<TypeMappingT[]>> {
        if(limit === -1) {
            return super.rows<TypeMappingT>(TypeMappingStorage.listAllNoTransformationsStatement(containerID, dataSourceID))
        }

        return super.rows<TypeMappingT>(TypeMappingStorage.listNoTransformationsStatement(containerID, dataSourceID, offset, limit, sortBy, sortDesc))
    }

    public ListByDataSource(dataSourceID: string, offset: number, limit: number): Promise<Result<TypeMappingT[]>> {
        return super.rows<TypeMappingT>(TypeMappingStorage.listByDataSourceStatement(dataSourceID, offset, limit))
    }

    public SetActive(id: string): Promise<Result<boolean>> {
        return super.runAsTransaction(TypeMappingStorage.setActiveStatement(id))
    }

    public SetInActive(id: string): Promise<Result<boolean>> {
        return super.runAsTransaction(TypeMappingStorage.setInactiveStatement(id))
    }

    public PermanentlyDelete(id: string): Promise<Result<boolean>> {
        return super.run(TypeMappingStorage.deleteStatement(id))
    }

    public async Count(dataSourceID: string): Promise<Result<number>> {
        return super.count(TypeMappingStorage.countStatement(dataSourceID))
    }

    public async CountNoTransformation(dataSourceID: string): Promise<Result<number>> {
        return super.count(TypeMappingStorage.countNoTransformationStatement(dataSourceID))
    }

    // Below are a set of query building functions. So far they're very simple
    // and the return value is something that the postgres-node driver can understand
    // My hope is that this method will allow us to be flexible and create more complicated
    // queries more easily.
    private static createStatement(imp: TypeMappingT): QueryConfig {
        return {
            text:`INSERT INTO data_type_mappings(id,container_id,data_source_id,shape_hash,active,sample_payload) VALUES($1,$2,$3,$4,$5,$6)`,
            values: [imp.id,imp.container_id,imp.data_source_id,imp.shape_hash,imp.active, JSON.stringify(imp.sample_payload)]
        }
    }

    private static retrieveStatement(exportID:string): QueryConfig {
        return {
            text:`SELECT * FROM data_type_mappings WHERE id = $1`,
            values: [exportID]
        }
    }

    private static retrieveByShapeHashStatement(dataSourceID: string, shapeHash: string): QueryConfig {
        return {
            text:`SELECT * FROM data_type_mappings WHERE data_source_id = $1 AND shape_hash = $2`,
            values: [dataSourceID, shapeHash]
        }
    }

    private static deleteStatement(exportID: string): QueryConfig {
        return {
            text:`DELETE FROM data_type_mappings WHERE id = $1`,
            values: [exportID]
        }
    }

    private static listStatement(containerID:string, dataSourceID:string, offset:number, limit:number, sortBy?:string, sortDesc?:boolean): QueryConfig {
        if(sortDesc && sortBy) {
            return {
                text: `SELECT * FROM data_type_mappings WHERE container_id = $1 AND data_source_id = $4 ORDER BY "${sortBy}" DESC OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        } else if(sortBy) {
            return {
                text: `SELECT * FROM data_type_mappings WHERE container_id = $1 AND data_source_id = $4 ORDER BY "${sortBy}" ASC OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        } else {
            return {
                text: `SELECT * FROM data_type_mappings WHERE container_id = $1 AND data_source_id = $4 OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        }
    }

    private static listNoTransformationsStatement(containerID:string, dataSourceID:string, offset:number, limit:number, sortBy?:string, sortDesc?:boolean): QueryConfig {
        if(sortDesc && sortBy) {
            return {
                text: `SELECT * FROM data_type_mappings
                       WHERE container_id = $1 AND data_source_id = $4
                       AND NOT EXISTS (SELECT 1 FROM data_type_mapping_transformations WHERE data_type_mapping_transformations.type_mapping_id = data_type_mappings.id)
                       ORDER BY "${sortBy}" DESC OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        } else if(sortBy) {
            return {
                text: `SELECT * FROM data_type_mappings
                       WHERE container_id = $1 AND data_source_id = $4
                       AND NOT EXISTS (SELECT 1 FROM data_type_mapping_transformations WHERE data_type_mapping_transformations.type_mapping_id = data_type_mappings.id)
                       ORDER BY "${sortBy}" ASC OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        } else {
            return {
                text: `SELECT * FROM data_type_mappings
                       WHERE container_id = $1 AND data_source_id = $4
                       AND NOT EXISTS (SELECT 1 FROM data_type_mapping_transformations WHERE data_type_mapping_transformations.type_mapping_id = data_type_mappings.id)
                       OFFSET $2 LIMIT $3`,
                values: [containerID, offset, limit, dataSourceID]
            }
        }
    }

    private static listAllStatement(containerID:string, dataSourceID:string ): QueryConfig {
        return {
            text: `SELECT * FROM data_type_mappings WHERE container_id = $1 AND data_source_id = $2`,
            values: [containerID, dataSourceID]
        }
    }

    private static listAllNoTransformationsStatement(containerID:string, dataSourceID:string ): QueryConfig {
        return {
            text: `SELECT * FROM data_type_mappings
                   WHERE container_id = $1 AND data_source_id = $2
                   AND NOT EXISTS (SELECT 1 FROM data_type_mapping_transformations WHERE data_type_mapping_transformations.type_mapping_id = data_type_mappings.id)`,
            values: [containerID, dataSourceID]
        }
    }

    private static listByDataSourceStatement(dataSourceID:string, offset:number, limit:number): QueryConfig {
        return {
            text: `SELECT * FROM data_type_mappings WHERE data_source_id = $1 OFFSET $2 LIMIT $3`,
            values: [dataSourceID, offset, limit]
        }
    }

    private static setActiveStatement(typeMappingID: string): QueryConfig {
        return {
            text: `UPDATE data_type_mappings SET active = true, modified_at = NOW() WHERE id = $1`,
            values: [typeMappingID]
        }
    }

    private static setInactiveStatement(typeMappingID: string): QueryConfig {
        return {
            text: `UPDATE data_type_mappings SET active = false, modified_at = NOW() WHERE id = $1`,
            values: [typeMappingID]
        }
    }

    private static countStatement(dataSourceID: string): QueryConfig {
        return {
            text: `SELECT COUNT(*) FROM data_type_mappings WHERE data_source_id = $1`,
            values: [dataSourceID]
        }
    }

    private static countNoTransformationStatement(dataSourceID: string): QueryConfig {
        return {
            text: `SELECT COUNT(*) FROM data_type_mappings
                   WHERE data_source_id = $1
                   AND NOT EXISTS (SELECT 1 FROM data_type_mapping_transformations WHERE data_type_mapping_transformations.type_mapping_id = data_type_mappings.id )`,
            values: [dataSourceID]
        }
    }
}
