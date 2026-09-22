import React, { useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { useChatWidget } from "../../features/ai/hooks/useChatWidget";

const ChatWidget = () => {
  const { axios, language, addToCart, t } = useAppContext();
  const {
    isOpen,
    setIsOpen,
    input,
    setInput,
    loading,
    messages,
    canSend,
    sendMessage,
    onAddProduct,
  } = useChatWidget({ axios, language, addToCart, t });

  const feedRef = useRef(null);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div className="fixed bottom-3 right-3 z-[60] sm:bottom-5 sm:right-6">
      {isOpen ? (
        <div className="max-h-[min(80vh,42rem)] w-[min(calc(100vw-1.5rem),24rem)] overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">GreenCart AI</p>
              <p className="text-[11px] opacity-90">{t("chat_widget_subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
            >
              {t("chat_close")}
            </button>
          </div>

          <div ref={feedRef} className="h-[min(20rem,50vh)] space-y-3 overflow-y-auto bg-emerald-50/50 px-3 py-3 sm:h-80">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 border border-emerald-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>

                {message.role === "assistant" && message.products?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.products.map((item) => (
                      <div
                        key={`${message.id}-${item.productId}`}
                        className="rounded-xl border border-emerald-100 bg-white p-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-emerald-100" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-800">{item.nameUk || item.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {item.offerPrice} x {item.quantity}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddProduct(item)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                          >
                            {t("add_to_cart")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && <p className="text-xs text-emerald-700">{t("chat_loading")}</p>}
          </div>

          <div className="border-t border-emerald-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                className="w-full resize-none rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
                placeholder={t("chat_input_placeholder")}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!canSend}
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {t("chat_send")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {t("chat_open_button")}
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
