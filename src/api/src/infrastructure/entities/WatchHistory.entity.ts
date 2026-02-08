import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("watch_history")
export class WatchHistory {
  @PrimaryGeneratedColumn("increment", { type: "integer" })
  id!: string;

  @Column({ name: "video_id", type: "varchar", length: 20, nullable: true })
  videoId!: string | null;

  @Column({ type: "text" })
  title!: string;

  @Column({ name: "channel_id", type: "varchar", length: 30 })
  channelId!: string;

  @Column({ name: "channel_name", type: "text" })
  channelName!: string;

  @Column({ name: "watched_at", type: "datetime" })
  watchedAt!: Date;

  @Column({ name: "activity_type", type: "varchar", length: 20 })
  activityType!: string;

  @Column({ name: "source_url", type: "text", nullable: true })
  sourceUrl!: string | null;
}
