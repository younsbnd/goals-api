-- CreateTable
CREATE TABLE "goal_categories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goal_categories_user_id_created_at_idx" ON "goal_categories"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "goal_categories" ADD CONSTRAINT "goal_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
