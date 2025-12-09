import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn()
  created_at: Date;
}
