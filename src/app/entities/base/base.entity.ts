import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class DatetimeEntity {
    @CreateDateColumn({
        name: 'created_at',
    })
    public createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    public updatedA: Date;
}