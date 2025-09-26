
import { AppLayout } from "@/components/app-layout";
import { TelegramBotClient } from "./components/telegram-bot-client";

export default function TelegramBotPage() {

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Telegram Bot
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Push key details directly to your Telegram.
          </p>
        </div>
        <TelegramBotClient />
      </div>
    </AppLayout>
  );
}
