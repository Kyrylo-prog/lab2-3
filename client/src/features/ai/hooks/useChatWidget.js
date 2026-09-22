import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { queryAssistantApi } from "../api/chatApi";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useChatWidget = ({ axios, language, addToCart, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: createId(),
      role: "assistant",
      isGreeting: true,
      text: t("chat_greeting"),
      products: [],
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      if (first.role !== "assistant" || !first.isGreeting) {
        return prev;
      }

      const localizedGreeting = t("chat_greeting");
      if (first.text === localizedGreeting) {
        return prev;
      }

      return [{ ...first, text: localizedGreeting }, ...prev.slice(1)];
    });
  }, [language, t]);

  const onAddProduct = (item) => {
    const quantity = Number(item.quantity || 1);
    for (let i = 0; i < quantity; i += 1) {
      addToCart(item.productId);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
      products: [],
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await queryAssistantApi(axios, {
        message: trimmed,
        mode: "chat",
        locale: language,
      });

      if (!response.success) {
        toast.error(response.message || t("chat_request_failed"));
        return;
      }

      const assistantMessage = {
        id: createId(),
        role: "assistant",
        text: response.reply,
        products: response.data?.products || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error.message || t("chat_request_failed"));
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    loading,
    messages,
    canSend,
    sendMessage,
    onAddProduct,
  };
};
