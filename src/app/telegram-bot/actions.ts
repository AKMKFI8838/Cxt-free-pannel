
"use server";

import { db } from "@/lib/firebase";
import { ref, update, get } from "firebase/database";
import type { User } from "@/lib/types";

export async function updateUserBotSettings({
  userId,
  botToken,
  chatId,
}: {
  userId: string;
  botToken: string;
  chatId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      throw new Error("User not authenticated.");
    }
    const userRef = ref(db, `users/${userId}`);
    const updates: Partial<User> = { telegramBotToken: botToken };
    if (chatId) {
        updates.telegramChatId = chatId;
    }
    await update(userRef, updates);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Could not update bot settings. Reason: ${errorMessage}`,
    };
  }
}

export async function getChatIdFromBot(
    botToken: string
): Promise<{ success: boolean; error?: string; chatId?: string }> {
    if (!botToken) {
        return { success: false, error: "Bot token is required." };
    }
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?limit=10&offset=-10`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Telegram API error: ${data.description}`);
        }
        
        const startMessage = data.result.reverse().find(update => update.message?.text === '/start');

        if (startMessage && startMessage.message?.chat?.id) {
            return { success: true, chatId: String(startMessage.message.chat.id) };
        } else {
            return { success: false, error: "Could not find a '/start' message from you. Please message your bot." };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get updates. Reason: ${errorMessage}` };
    }
}


export async function pushToTelegram(
  message: string,
  user: User | null
): Promise<{ success: boolean; error?: string }> {
  
  if (!user) {
    return { success: false, error: "User not found." };
  }

  const { telegramBotToken, telegramChatId } = user;

  if (!telegramBotToken || !telegramChatId) {
    return {
      success: false,
      error: "Bot token or Chat ID is not configured for your account. Please set them up first.",
    };
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to send message. Reason: ${errorMessage}` };
  }
}
