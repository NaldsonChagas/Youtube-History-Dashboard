import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("watch_history")
export class WatchHistory {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  video_id!: string | null;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "varchar", length: 30 })
  channel_id!: string;

  @Column({ type: "text" })
  channel_name!: string;

  @Column({ type: "timestamptz" })
  watched_at!: Date;

  @Column({ type: "varchar", length: 20 })
  activity_type!: string;

  @Column({ type: "text", nullable: true })
  source_url!: string | null;
}
