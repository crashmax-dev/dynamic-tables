CREATE TYPE "public"."column_type" AS ENUM('text', 'number', 'select', 'toggle', 'date');--> statement-breakpoint
CREATE TABLE "column_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"column_id" integer NOT NULL,
	"label" text NOT NULL,
	"color" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"row_id" integer NOT NULL,
	"column_id" integer NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "table_columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "column_type" DEFAULT 'text' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "table_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "column_options" ADD CONSTRAINT "column_options_column_id_table_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."table_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_values" ADD CONSTRAINT "entity_values_row_id_table_rows_id_fk" FOREIGN KEY ("row_id") REFERENCES "public"."table_rows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_values" ADD CONSTRAINT "entity_values_column_id_table_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."table_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_columns" ADD CONSTRAINT "table_columns_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_rows" ADD CONSTRAINT "table_rows_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE cascade ON UPDATE no action;