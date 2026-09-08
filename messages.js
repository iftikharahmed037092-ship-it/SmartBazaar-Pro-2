/* ============================================================
   SMARTBAZAAR PRO 2
   FEATURE: FULL MESSAGING MODULE
   FILE: messages.js

   IMPORTANT:
   - UI / interaction layer only
   - No invented Firebase paths
   - No invented Firebase fields
   - Firebase/Auth integration will be added after
     inspecting the project's actual Firebase architecture.
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     FEATURE: GLOBAL CONFIGURATION
     ============================================================ */

  const CONFIG = {
    storageKey: "smartbazaar_messages_ui_state",
    pendingProductKey: "smartbazaar_pending_product_chat",
    pendingOrderKey: "smartbazaar_pending_order_chat",

    maxImageSize: 10 * 1024 * 1024,
    maxFileSize: 20 * 1024 * 1024,

    typingTimeout: 1400,
    toastDuration: 2800,

    demoUser: {
      id: "demo-user",
      name: "You"
    }
  };


  /* ============================================================
     FEATURE: APPLICATION STATE
     ============================================================ */

  const state = {
    currentUser: null,

    conversations: [],
    messages: {},

    activeConversationId: null,

    activeFilter: "all",

    conversationSearch: "",
    messageSearch: "",

    isChatOpen: false,

    isChatSearchOpen: false,
    isChatInfoOpen: false,
    isChatOptionsOpen: false,

    isEmojiOpen: false,

    selectedProduct: null,
    selectedOrder: null,

    selectedAttachment: null,

    replyTo: null,

    editingMessageId: null,

    typing: false,

    typingTimer: null,

    toastTimer: null,

    messageCounter: 0,

    initialized: false,

    demoMode: true,

    blockedUsers: new Set(),

    mutedConversations: new Set(),

    archivedConversations: new Set()
  };


  /* ============================================================
     FEATURE: DOM CACHE
     ============================================================ */

  const $ = (selector, root = document) => {
    try {
      return root.querySelector(selector);
    } catch {
      return null;
    }
  };

  const $$ = (selector, root = document) => {
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch {
      return [];
    }
  };

  const byId = (id) => document.getElementById(id);


  const DOM = {};


  function cacheDOM() {

    DOM.body = document.body;

    /* Main containers */
    DOM.app = byId("messagesApp") ||
      $(".messages-app") ||
      $(".messaging-app") ||
      $(".messages-page");

    DOM.conversationList = byId("conversationList") ||
      $(".conversation-list");

    DOM.conversationItems = byId("conversationItems") ||
      $(".conversation-items");

    DOM.chatPanel = byId("chatPanel") ||
      $(".chat-panel");

    DOM.chatMessages = byId("chatMessages") ||
      $(".chat-messages") ||
      $(".messages-container");

    DOM.chatEmpty = byId("chatEmpty") ||
      $(".chat-empty");

    DOM.chatHeader = byId("chatHeader") ||
      $(".chat-header");

    /* Search */
    DOM.conversationSearch = byId("conversationSearch") ||
      $(".conversation-search input");

    DOM.messageSearch = byId("messageSearch") ||
      $(".chat-search input");

    /* Composer */
    DOM.messageInput = byId("messageInput") ||
      byId("messageTextarea") ||
      $(".message-input") ||
      $(".composer textarea") ||
      $(".composer input");

    DOM.sendButton = byId("sendMessageBtn") ||
      byId("sendBtn") ||
      $(".send-message");

    DOM.emojiButton = byId("emojiBtn") ||
      byId("emojiButton");

    DOM.emojiPicker = byId("emojiPicker") ||
      $(".emoji-picker");

    DOM.attachmentButton = byId("attachmentBtn") ||
      byId("attachBtn");

    DOM.fileInput = byId("fileInput") ||
      byId("attachmentInput");

    DOM.attachmentPreview = byId("attachmentPreview") ||
      $(".attachment-preview");

    /* Typing */
    DOM.typingIndicator = byId("typingIndicator") ||
      $(".typing-indicator");

    /* Unread counters */
    DOM.globalUnread = byId("messageUnreadCount") ||
      byId("messagesUnreadCount") ||
      $(".messages-unread-count");

    /* Product context */
    DOM.productContext = byId("productContext") ||
      $(".product-chat-context");

    /* Order context */
    DOM.orderContext = byId("orderContext") ||
      $(".order-chat-context");

    /* Reply */
    DOM.replyPreview = byId("replyPreview") ||
      $(".reply-preview");

    /* Modals */
    DOM.newMessageModal = byId("newMessageModal") ||
      $(".new-message-modal");

    DOM.reportModal = byId("reportModal") ||
      $(".report-modal");

    DOM.offerModal = byId("offerModal") ||
      $(".offer-modal");

    DOM.imagePreviewModal = byId("imagePreviewModal") ||
      $(".image-preview-modal");

    DOM.filePreviewModal = byId("filePreviewModal") ||
      $(".file-preview-modal");

    DOM.loading = byId("messagesLoading") ||
      $(".messages-loading");

    DOM.empty = byId("messagesEmpty") ||
      $(".messages-empty");

    DOM.error = byId("messagesError") ||
      $(".messages-error");

    DOM.toast = byId("messageToast") ||
      $(".message-toast");

    /* Mobile */
    DOM.mobileBack = byId("mobileChatBack") ||
      byId("chatBackBtn") ||
      $(".mobile-chat-back");

    /* Chat information */
    DOM.chatInfo = byId("chatInfoPanel") ||
      $(".chat-info-panel");

    DOM.chatOptions = byId("chatOptionsMenu") ||
      $(".chat-options-menu");

    /* Conversation filters */
    DOM.filterButtons = $$(
      "[data-message-filter], " +
      "[data-filter], " +
      ".message-filter"
    );
  }


  /* ============================================================
     FEATURE: SAFE HTML
     ============================================================ */

  function escapeHTML(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function escapeAttribute(value) {
    return escapeHTML(value);
  }


  /* ============================================================
     FEATURE: SAFE IMAGE URL
     ============================================================ */

  function safeImage(url) {

    if (!url) {
      return "";
    }

    try {

      const parsed = new URL(url, window.location.href);

      const allowed = [
        "http:",
        "https:",
        "data:",
        "blob:"
      ];

      if (!allowed.includes(parsed.protocol)) {
        return "";
      }

      return parsed.href;

    } catch {

      return "";
    }
  }


  /* ============================================================
     FEATURE: FORMATTERS
     ============================================================ */

  function formatTime(timestamp) {

    const date = timestamp instanceof Date
      ? timestamp
      : new Date(timestamp || Date.now());

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }


  function formatDate(timestamp) {

    const date = new Date(timestamp || Date.now());

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }


  function formatLastSeen(timestamp) {

    if (!timestamp) {
      return "Last seen recently";
    }

    return `Last seen ${formatDate(timestamp)} ${formatTime(timestamp)}`;
  }


  function formatFileSize(bytes) {

    if (!bytes || bytes <= 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }


  /* ============================================================
     FEATURE: STORAGE
     ============================================================ */

  function saveUIState() {

    try {

      const data = {
        activeConversationId: state.activeConversationId,
        activeFilter: state.activeFilter,
        mutedConversations: Array.from(
          state.mutedConversations
        ),
        archivedConversations: Array.from(
          state.archivedConversations
        ),
        blockedUsers: Array.from(
          state.blockedUsers
        )
      };

      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(data)
      );

    } catch (error) {

      console.warn(
        "Messaging UI state could not be saved.",
        error
      );
    }
  }


  function loadUIState() {

    try {

      const raw = localStorage.getItem(
        CONFIG.storageKey
      );

      if (!raw) {
        return;
      }

      const data = JSON.parse(raw);

      if (data.activeConversationId) {
        state.activeConversationId =
          data.activeConversationId;
      }

      if (data.activeFilter) {
        state.activeFilter = data.activeFilter;
      }

      if (Array.isArray(data.mutedConversations)) {
        state.mutedConversations =
          new Set(data.mutedConversations);
      }

      if (Array.isArray(data.archivedConversations)) {
        state.archivedConversations =
          new Set(data.archivedConversations);
      }

      if (Array.isArray(data.blockedUsers)) {
        state.blockedUsers =
          new Set(data.blockedUsers);
      }

    } catch (error) {

      console.warn(
        "Messaging UI state could not be loaded.",
        error
      );
    }
  }


  /* ============================================================
     FEATURE: DEMO DATA
     
     This exists only so the complete UI can be tested before
     Firebase integration.
     ============================================================ */

  function createDemoData() {

    const now = Date.now();

    state.currentUser = {
      id: CONFIG.demoUser.id,
      name: CONFIG.demoUser.name
    };


    state.conversations = [

      {
        id: "conversation-1",
        type: "seller",
        participantId: "seller-ali",
        participantName: "Ali Electronics",
        participantRole: "Seller",
        avatar: "",
        online: true,
        lastSeen: now,
        unread: 2,
        muted: false,
        archived: false,
        product: {
          id: "product-001",
          title: "Premium Wireless Headphones",
          price: "Rs. 5,000",
          image: "",
          url: "#"
        },
        order: null,
        lastMessage: "Is this product still available?",
        lastMessageAt: now - 120000
      },


      {
        id: "conversation-2",
        type: "buyer",
        participantId: "buyer-hassan",
        participantName: "Hassan",
        participantRole: "Buyer",
        avatar: "",
        online: false,
        lastSeen: now - 3600000,
        unread: 0,
        muted: false,
        archived: false,
        product: {
          id: "product-002",
          title: "Smart Watch",
          price: "Rs. 7,500",
          image: "",
          url: "#"
        },
        order: null,
        lastMessage: "Thank you!",
        lastMessageAt: now - 7200000
      },


      {
        id: "conversation-3",
        type: "support",
        participantId: "admin-support",
        participantName: "SmartBazaar Support",
        participantRole: "Admin / Support",
        avatar: "",
        online: true,
        lastSeen: now,
        unread: 1,
        muted: false,
        archived: false,
        product: null,
        order: {
          id: "SBP-10025",
          status: "Shipped"
        },
        lastMessage: "Your order has been shipped.",
        lastMessageAt: now - 1800000
      }

    ];


    state.messages = {

      "conversation-1": [

        {
          id: "m1",
          senderId: "seller-ali",
          senderName: "Ali Electronics",
          type: "system",
          text: "Product conversation started.",
          timestamp: now - 86400000,
          status: "read"
        },

        {
          id: "m2",
          senderId: "seller-ali",
          senderName: "Ali Electronics",
          type: "text",
          text: "Hello! How can I help you?",
          timestamp: now - 3600000,
          status: "read"
        },

        {
          id: "m3",
          senderId: "demo-user",
          senderName: "You",
          type: "text",
          text: "Is this product still available?",
          timestamp: now - 120000,
          status: "read"
        }

      ],


      "conversation-2": [

        {
          id: "m4",
          senderId: "buyer-hassan",
          senderName: "Hassan",
          type: "text",
          text: "Can you ship this product tomorrow?",
          timestamp: now - 10800000,
          status: "read"
        },

        {
          id: "m5",
          senderId: "demo-user",
          senderName: "You",
          type: "text",
          text: "Yes, we can arrange shipment.",
          timestamp: now - 9000000,
          status: "read"
        },

        {
          id: "m6",
          senderId: "buyer-hassan",
          senderName: "Hassan",
          type: "text",
          text: "Thank you!",
          timestamp: now - 7200000,
          status: "read"
        }

      ],


      "conversation-3": [

        {
          id: "m7",
          senderId: "system",
          senderName: "SmartBazaar",
          type: "system",
          text: "Order SBP-10025 has been confirmed.",
          timestamp: now - 7200000,
          status: "read"
        },

        {
          id: "m8",
          senderId: "system",
          senderName: "SmartBazaar",
          type: "system",
          text: "Your order has been shipped.",
          timestamp: now - 1800000,
          status: "read"
        }

      ]

    };
  }


  /* ============================================================
     FEATURE: CONVERSATION HELPERS
     ============================================================ */

  function getConversation(id) {

    return state.conversations.find(
      conversation => conversation.id === id
    ) || null;
  }


  function getActiveConversation() {

    if (!state.activeConversationId) {
      return null;
    }

    return getConversation(
      state.activeConversationId
    );
  }


  function getConversationMessages(id) {

    if (!state.messages[id]) {
      state.messages[id] = [];
    }

    return state.messages[id];
  }


  function isOwnMessage(message) {

    return message.senderId ===
      state.currentUser?.id;
  }


  function getTotalUnread() {

    return state.conversations.reduce(
      (total, conversation) =>
        total + Number(conversation.unread || 0),
      0
    );
  }


  /* ============================================================
     FEATURE: CONVERSATION FILTERING
     ============================================================ */

  function filterConversations() {

    const search =
      state.conversationSearch
        .trim()
        .toLowerCase();


    return state.conversations.filter(
      conversation => {

        const name =
          String(conversation.participantName || "")
            .toLowerCase();

        const lastMessage =
          String(conversation.lastMessage || "")
            .toLowerCase();

        const product =
          String(
            conversation.product?.title || ""
          ).toLowerCase();

        const matchesSearch =
          !search ||
          name.includes(search) ||
          lastMessage.includes(search) ||
          product.includes(search);


        if (!matchesSearch) {
          return false;
        }


        switch (state.activeFilter) {

          case "unread":
            return Number(conversation.unread) > 0;

          case "buyers":
            return conversation.type === "buyer";

          case "sellers":
            return conversation.type === "seller";

          case "support":
            return conversation.type === "support";

          case "orders":
            return !!conversation.order;

          case "archived":
            return !!conversation.archived;

          case "all":
          default:
            return !conversation.archived;
        }

      }
    );
  }


  /* ============================================================
     FEATURE: RENDER CONVERSATIONS
     ============================================================ */

  function renderConversations() {

    const container =
      DOM.conversationItems ||
      DOM.conversationList;

    if (!container) {
      return;
    }


    const conversations =
      filterConversations();


    if (!conversations.length) {

      container.innerHTML = `
        <div class="messages-list-empty">
          <div class="empty-icon">💬</div>
          <h3>No conversations found</h3>
          <p>There are no conversations matching your search.</p>
        </div>
      `;

      updateUnreadCount();

      return;
    }


    container.innerHTML =
      conversations.map(
        renderConversationItem
      ).join("");


    updateUnreadCount();
  }


  function renderConversationItem(conversation) {

    const avatar =
      safeImage(conversation.avatar);


    const unread =
      Number(conversation.unread || 0);


    const active =
      conversation.id ===
      state.activeConversationId;


    const muted =
      conversation.muted ||
      state.mutedConversations.has(
        conversation.id
      );


    const archived =
      conversation.archived ||
      state.archivedConversations.has(
        conversation.id
      );


    return `
      <button
        type="button"
        class="conversation-item
          ${active ? "active" : ""}
          ${unread ? "has-unread" : ""}
          ${muted ? "is-muted" : ""}
          ${archived ? "is-archived" : ""}"
        data-conversation-id="${escapeAttribute(
          conversation.id
        )}"
      >

        <span class="conversation-avatar">

          ${
            avatar
              ? `
                <img
                  src="${escapeAttribute(avatar)}"
                  alt="${escapeAttribute(
                    conversation.participantName
                  )}"
                >
              `
              : `
                <span class="avatar-placeholder">
                  ${escapeHTML(
                    (conversation.participantName || "?")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </span>
              `
          }

          ${
            conversation.online
              ? `<span class="online-dot"></span>`
              : ""
          }

        </span>


        <span class="conversation-content">

          <span class="conversation-top">

            <strong>
              ${escapeHTML(
                conversation.participantName
              )}
            </strong>

            <time>
              ${formatTime(
                conversation.lastMessageAt
              )}
            </time>

          </span>


          <span class="conversation-preview">

            <span>
              ${escapeHTML(
                conversation.lastMessage || ""
              )}
            </span>

            ${
              unread
                ? `
                  <span class="unread-badge">
                    ${unread > 99 ? "99+" : unread}
                  </span>
                `
                : ""
            }

          </span>


          <span class="conversation-meta">

            <span>
              ${escapeHTML(
                conversation.participantRole || ""
              )}
            </span>

            ${
              conversation.product
                ? `<span>• Product</span>`
                : ""
            }

            ${
              conversation.order
                ? `<span>• Order</span>`
                : ""
            }

            ${
              muted
                ? `<span>• Muted</span>`
                : ""
            }

          </span>

        </span>

      </button>
    `;
  }


  /* ============================================================
     FEATURE: OPEN CONVERSATION
     ============================================================ */

  function openConversation(
    conversationId,
    options = {}
  ) {

    const conversation =
      getConversation(conversationId);


    if (!conversation) {

      showToast(
        "Conversation not found.",
        "error"
      );

      return false;
    }


    state.activeConversationId =
      conversationId;


    state.isChatOpen = true;


    /* Mark as read */
    if (options.markRead !== false) {

      conversation.unread = 0;

      markMessagesAsRead(conversationId);
    }


    saveUIState();

    renderConversations();

    renderChat(conversation);

    updateMobileChatState(true);

    return true;
  }


  /* ============================================================
     FEATURE: RENDER CHAT
     ============================================================ */

  function renderChat(conversation) {

    if (!conversation) {
      return;
    }


    renderChatHeader(conversation);

    renderProductContext(conversation);

    renderOrderContext(conversation);

    renderMessages(conversation.id);

    renderTypingIndicator(false);

    updateChatStatus(conversation);

    renderReplyPreview();

    scrollMessagesToBottom();

    if (DOM.chatEmpty) {
      DOM.chatEmpty.hidden = true;
    }
  }


  /* ============================================================
     FEATURE: CHAT HEADER
     ============================================================ */

  function renderChatHeader(conversation) {

    if (!DOM.chatHeader) {
      return;
    }


    const online =
      !!conversation.online;


    const avatar =
      safeImage(conversation.avatar);


    DOM.chatHeader.innerHTML = `

      <div class="chat-user">

        <button
          type="button"
          class="chat-avatar"
          data-chat-user
        >

          ${
            avatar
              ? `
                <img
                  src="${escapeAttribute(avatar)}"
                  alt="${escapeAttribute(
                    conversation.participantName
                  )}"
                >
              `
              : `
                <span>
                  ${escapeHTML(
                    conversation.participantName
                      ?.charAt(0)
                      .toUpperCase() || "?"
                  )}
                </span>
              `
          }

        </button>


        <div class="chat-user-details">

          <strong>
            ${escapeHTML(
              conversation.participantName
            )}
          </strong>

          <span
            class="
              chat-presence
              ${online ? "online" : "offline"}
            "
          >
            ${
              online
                ? "Online"
                : formatLastSeen(
                    conversation.lastSeen
                  )
            }
          </span>

        </div>

      </div>


      <div class="chat-header-actions">

        <button
          type="button"
          data-action="chat-search"
          aria-label="Search messages"
          title="Search messages"
        >
          🔎
        </button>

        <button
          type="button"
          data-action="voice-call"
          aria-label="Voice call"
          title="Voice call"
        >
          📞
        </button>

        <button
          type="button"
          data-action="video-call"
          aria-label="Video call"
          title="Video call"
        >
          🎥
        </button>

        <button
          type="button"
          data-action="chat-info"
          aria-label="Chat information"
          title="Chat information"
        >
          ⓘ
        </button>

        <button
          type="button"
          data-action="chat-options"
          aria-label="Chat options"
          title="Chat options"
        >
          ⋮
        </button>

      </div>

    `;
  }


  function updateChatStatus(conversation) {

    const statusElements =
      $$(".chat-presence");


    statusElements.forEach(element => {

      if (conversation.online) {

        element.textContent = "Online";
        element.classList.add("online");
        element.classList.remove("offline");

      } else {

        element.textContent =
          formatLastSeen(
            conversation.lastSeen
          );

        element.classList.add("offline");
        element.classList.remove("online");
      }

    });
  }


  /* ============================================================
     FEATURE: PRODUCT CONTEXT
     ============================================================ */

  function renderProductContext(conversation) {

    if (!DOM.productContext) {
      return;
    }


    const product =
      state.selectedProduct ||
      conversation.product;


    if (!product) {

      DOM.productContext.innerHTML = "";
      DOM.productContext.hidden = true;

      return;
    }


    const image =
      safeImage(product.image);


    DOM.productContext.hidden = false;


    DOM.productContext.innerHTML = `

      <div class="product-context-card">

        <div class="product-context-image">

          ${
            image
              ? `
                <img
                  src="${escapeAttribute(image)}"
                  alt="${escapeAttribute(
                    product.title
                  )}"
                >
              `
              : `
                <span>🛍️</span>
              `
          }

        </div>


        <div class="product-context-details">

          <small>Product</small>

          <strong>
            ${escapeHTML(product.title || "Product")}
          </strong>

          ${
            product.price
              ? `
                <span class="product-context-price">
                  ${escapeHTML(product.price)}
                </span>
              `
              : ""
          }

        </div>


        ${
          product.url
            ? `
              <a
                href="${escapeAttribute(product.url)}"
                class="product-context-view"
              >
                View Product
              </a>
            `
            : ""
        }

      </div>

    `;
  }


  /* ============================================================
     FEATURE: ORDER CONTEXT
     ============================================================ */

  function renderOrderContext(conversation) {

    if (!DOM.orderContext) {
      return;
    }


    const order =
      state.selectedOrder ||
      conversation.order;


    if (!order) {

      DOM.orderContext.innerHTML = "";
      DOM.orderContext.hidden = true;

      return;
    }


    DOM.orderContext.hidden = false;


    DOM.orderContext.innerHTML = `

      <div class="order-context-card">

        <div class="order-context-icon">
          📦
        </div>

        <div class="order-context-details">

          <small>Order</small>

          <strong>
            ${escapeHTML(order.id || "Order")}
          </strong>

          ${
            order.status
              ? `
                <span>
                  Status:
                  <strong>
                    ${escapeHTML(order.status)}
                  </strong>
                </span>
              `
              : ""
          }

        </div>

        ${
          order.url
            ? `
              <a
                href="${escapeAttribute(order.url)}"
                class="order-context-view"
              >
                View Order
              </a>
            `
            : ""
        }

      </div>

    `;
  }


  /* ============================================================
     FEATURE: RENDER MESSAGES
     ============================================================ */

  function renderMessages(conversationId) {

    if (!DOM.chatMessages) {
      return;
    }


    let messages =
      getConversationMessages(
        conversationId
      );


    const search =
      state.messageSearch
        .trim()
        .toLowerCase();


    if (search) {

      messages = messages.filter(
        message => {

          const text =
            String(message.text || "")
              .toLowerCase();

          return text.includes(search);
        }
      );
    }


    if (!messages.length) {

      DOM.chatMessages.innerHTML = `
        <div class="chat-messages-empty">
          <div>💬</div>
          <strong>
            ${
              search
                ? "No messages found"
                : "No messages yet"
            }
          </strong>
          <span>
            ${
              search
                ? "Try another search."
                : "Start the conversation."
            }
          </span>
        </div>
      `;

      return;
    }


    let previousDate = "";


    DOM.chatMessages.innerHTML =
      messages.map(message => {

        const currentDate =
          formatDate(message.timestamp);


        let dateSeparator = "";


        if (currentDate !== previousDate) {

          previousDate = currentDate;

          dateSeparator = `
            <div class="message-date-separator">
              <span>${escapeHTML(
                currentDate
              )}</span>
            </div>
          `;
        }


        return `
          ${dateSeparator}
          ${renderMessage(message)}
        `;

      }).join("");
  }


  /* ============================================================
     FEATURE: RENDER SINGLE MESSAGE
     ============================================================ */

  function renderMessage(message) {

    const own =
      isOwnMessage(message);


    const type =
      message.type || "text";


    if (type === "system") {
      return renderSystemMessage(message);
    }


    const classes = [
      "message-row",
      own ? "own" : "other",
      `message-${type}`
    ].join(" ");


    return `

      <div
        class="${classes}"
        data-message-id="${escapeAttribute(
          message.id
        )}"
      >

        <div class="message-bubble">

          ${
            message.replyTo
              ? renderQuotedReply(
                  message.replyTo
                )
              : ""
          }


          ${
            renderMessageContent(
              message
            )
          }


          ${
            message.offer
              ? renderOffer(
                  message.offer
                )
              : ""
          }


          <div class="message-meta">

            <time>
              ${formatTime(
                message.timestamp
              )}
            </time>

            ${
              own
                ? renderMessageStatus(
                    message.status
                  )
                : ""
            }

          </div>


          ${renderMessageActions(message)}

        </div>

      </div>

    `;
  }


  /* ============================================================
     FEATURE: MESSAGE CONTENT
     ============================================================ */

  function renderMessageContent(message) {

    switch (message.type) {

      case "image":

        return `

          <button
            type="button"
            class="message-image"
            data-action="preview-image"
            data-image-url="${escapeAttribute(
              safeImage(message.url)
            )}"
          >

            <img
              src="${escapeAttribute(
                safeImage(message.url)
              )}"
              alt="${escapeAttribute(
                message.fileName || "Image"
              )}"
              loading="lazy"
            >

          </button>

        `;


      case "file":

      case "pdf":

        return `

          <button
            type="button"
            class="message-file"
            data-action="preview-file"
            data-file-url="${escapeAttribute(
              message.url || ""
            )}"
          >

            <span class="file-icon">
              📄
            </span>

            <span class="file-details">

              <strong>
                ${escapeHTML(
                  message.fileName ||
                  "Attached file"
                )}
              </strong>

              ${
                message.fileSize
                  ? `
                    <small>
                      ${formatFileSize(
                        message.fileSize
                      )}
                    </small>
                  `
                  : ""
              }

            </span>

          </button>

        `;


      case "text":

      default:

        return `
          <div class="message-text">
            ${formatMessageText(
              message.text || ""
            )}
          </div>
        `;
    }
  }


  /* ============================================================
     FEATURE: MESSAGE TEXT
     ============================================================ */

  function formatMessageText(text) {

    let safe =
      escapeHTML(text);


    /* URLs */
    safe = safe.replace(
      /(https?:\/\/[^\s<]+)/gi,
      url => `
        <a
          href="${escapeAttribute(url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHTML(url)}
        </a>
      `
    );


    /* Line breaks */
    safe = safe.replace(
      /\n/g,
      "<br>"
    );


    return safe;
  }


  /* ============================================================
     FEATURE: QUOTED REPLY
     ============================================================ */

  function renderQuotedReply(reply) {

    if (!reply) {
      return "";
    }


    return `

      <div
        class="message-quoted-reply"
        data-action="scroll-to-message"
        data-message-id="${escapeAttribute(
          reply.id || ""
        )}"
      >

        <strong>
          ${escapeHTML(
            reply.senderName || ""
          )}
        </strong>

        <span>
          ${escapeHTML(
            reply.text ||
            reply.fileName ||
            "Attachment"
          )}
        </span>

      </div>

    `;
  }


  /* ============================================================
     FEATURE: MESSAGE STATUS
     ============================================================ */

  function renderMessageStatus(status) {

    switch (status) {

      case "read":
        return `
          <span
            class="message-status read"
            title="Read"
            aria-label="Read"
          >
            ✓✓
          </span>
        `;


      case "delivered":
        return `
          <span
            class="message-status delivered"
            title="Delivered"
            aria-label="Delivered"
          >
            ✓✓
          </span>
        `;


      case "sent":
        return `
          <span
            class="message-status sent"
            title="Sent"
            aria-label="Sent"
          >
            ✓
          </span>
        `;


      case "sending":
        return `
          <span
            class="message-status sending"
            title="Sending"
            aria-label="Sending"
          >
            ◷
          </span>
        `;


      case "failed":
        return `
          <span
            class="message-status failed"
            title="Failed"
            aria-label="Failed"
          >
            !
          </span>
        `;


      default:
        return "";
    }
  }


  /* ============================================================
     FEATURE: MESSAGE ACTIONS
     ============================================================ */

  function renderMessageActions(message) {

    if (message.type === "system") {
      return "";
    }


    return `

      <div class="message-actions">

        <button
          type="button"
          data-action="reply-message"
          data-message-id="${escapeAttribute(
            message.id
          )}"
          title="Reply"
        >
          ↩
        </button>

        <button
          type="button"
          data-action="copy-message"
          data-message-id="${escapeAttribute(
            message.id
          )}"
          title="Copy"
        >
          ⧉
        </button>

        ${
          isOwnMessage(message)
            ? `
              <button
                type="button"
                data-action="delete-message"
                data-message-id="${escapeAttribute(
                  message.id
                )}"
                title="Delete"
              >
                🗑
              </button>
            `
            : ""
        }

        <button
          type="button"
          data-action="report-message"
          data-message-id="${escapeAttribute(
            message.id
          )}"
          title="Report"
        >
          ⚑
        </button>

      </div>

    `;
  }


  /* ============================================================
     FEATURE: SYSTEM MESSAGE
     ============================================================ */

  function renderSystemMessage(message) {

    return `

      <div
        class="system-message"
        data-message-id="${escapeAttribute(
          message.id
        )}"
      >

        <span class="system-message-icon">
          ℹ
        </span>

        <span>
          ${escapeHTML(
            message.text || ""
          )}
        </span>

        <time>
          ${formatTime(
            message.timestamp
          )}
        </time>

      </div>

    `;
  }


  /* ============================================================
     FEATURE: OFFER CARD
     ============================================================ */

  function renderOffer(offer) {

    if (!offer) {
      return "";
    }


    const status =
      offer.status || "pending";


    return `

      <div
        class="
          message-offer-card
          offer-${escapeAttribute(status)}
        "
      >

        <div class="offer-header">
          <span>💰</span>
          <strong>Custom Offer</strong>
        </div>


        <div class="offer-price">
          ${escapeHTML(
            offer.price || "Rs. 0"
          )}
        </div>


        ${
          offer.note
            ? `
              <p>
                ${escapeHTML(
                  offer.note
                )}
              </p>
            `
            : ""
        }


        ${
          status === "pending"
            ? `
              <div class="offer-actions">

                <button
                  type="button"
                  data-action="accept-offer"
                  data-offer-id="${escapeAttribute(
                    offer.id || ""
                  )}"
                >
                  Accept
                </button>

                <button
                  type="button"
                  data-action="reject-offer"
                  data-offer-id="${escapeAttribute(
                    offer.id || ""
                  )}"
                >
                  Reject
                </button>

              </div>
            `
            : `
              <div class="offer-status">
                ${escapeHTML(
                  status.charAt(0).toUpperCase() +
                  status.slice(1)
                )}
              </div>
            `
        }

      </div>

    `;
  }


  /* ============================================================
     FEATURE: SEND MESSAGE
     ============================================================ */

  function sendMessage() {

    const conversation =
      getActiveConversation();


    if (!conversation) {

      showToast(
        "Please select a conversation.",
        "warning"
      );

      return;
    }


    if (
      state.blockedUsers.has(
        conversation.participantId
      )
    ) {

      showToast(
        "This user is blocked.",
        "error"
      );

      return;
    }


    const text =
      DOM.messageInput?.value?.trim() || "";


    const hasAttachment =
      !!state.selectedAttachment;


    const hasProduct =
      !!state.selectedProduct;


    const hasOrder =
      !!state.selectedOrder;


    if (
      !text &&
      !hasAttachment &&
      !hasProduct &&
      !hasOrder
    ) {

      showToast(
        "Write a message or attach something.",
        "warning"
      );

      focusMessageInput();

      return;
    }


    const message =
      buildOutgoingMessage(text);


    if (!state.messages[conversation.id]) {
      state.messages[conversation.id] = [];
    }


    state.messages[
      conversation.id
    ].push(message);


    conversation.lastMessage =
      getMessagePreview(message);


    conversation.lastMessageAt =
      message.timestamp;


    conversation.unread = 0;


    /* Clear composer */
    if (DOM.messageInput) {
      DOM.messageInput.value = "";
      autoResizeInput();
    }


    clearAttachment();

    clearReply();

    clearSelectedContext();


    renderMessages(
      conversation.id
    );


    renderConversations();


    scrollMessagesToBottom();


    updateTyping(false);


    saveUIState();


    /* Demo delivery simulation */
    simulateMessageDelivery(
      conversation.id,
      message.id
    );


    return message;
  }


  /* ============================================================
     FEATURE: BUILD OUTGOING MESSAGE
     ============================================================ */

  function buildOutgoingMessage(text) {

    state.messageCounter++;


    const timestamp =
      Date.now();


    const message = {

      id:
        `local-${timestamp}-${state.messageCounter}`,

      senderId:
        state.currentUser?.id ||
        CONFIG.demoUser.id,

      senderName:
        state.currentUser?.name ||
        "You",

      type:
        "text",

      text,

      timestamp,

      status:
        "sending"

    };


    if (state.selectedAttachment) {

      const attachment =
        state.selectedAttachment;


      message.type =
        attachment.type === "image"
          ? "image"
          : "file";


      message.url =
        attachment.url ||
        attachment.previewUrl ||
        "";


      message.fileName =
        attachment.fileName ||
        attachment.name ||
        "Attachment";


      message.fileSize =
        attachment.fileSize ||
        attachment.size ||
        0;

    }


    if (state.replyTo) {

      message.replyTo = {
        id: state.replyTo.id,
        senderName:
          state.replyTo.senderName,
        text:
          state.replyTo.text ||
          state.replyTo.fileName ||
          "Attachment"
      };

    }


    if (state.selectedProduct) {

      message.productContext = {
        ...state.selectedProduct
      };

    }


    if (state.selectedOrder) {

      message.orderContext = {
        ...state.selectedOrder
      };

    }


    return message;
  }


  /* ============================================================
     FEATURE: MESSAGE PREVIEW
     ============================================================ */

  function getMessagePreview(message) {

    if (message.type === "image") {
      return "📷 Image";
    }

    if (
      message.type === "file" ||
      message.type === "pdf"
    ) {
      return `📎 ${message.fileName || "File"}`;
    }

    if (message.offer) {
      return `💰 Offer: ${message.offer.price}`;
    }

    if (message.text) {
      return message.text;
    }

    return "Attachment";
  }


  /* ============================================================
     FEATURE: DELIVERY SIMULATION
     
     Temporary UI only.
     Real Firebase delivery/read state comes later.
     ============================================================ */

  function simulateMessageDelivery(
    conversationId,
    messageId
  ) {

    setTimeout(() => {

      updateMessageStatus(
        conversationId,
        messageId,
        "sent"
      );

    }, 300);


    setTimeout(() => {

      updateMessageStatus(
        conversationId,
        messageId,
        "delivered"
      );

    }, 1000);


    setTimeout(() => {

      updateMessageStatus(
        conversationId,
        messageId,
        "read"
      );

    }, 1800);
  }


  function updateMessageStatus(
    conversationId,
    messageId,
    status
  ) {

    const messages =
      getConversationMessages(
        conversationId
      );


    const message =
      messages.find(
        item => item.id === messageId
      );


    if (!message) {
      return;
    }


    message.status = status;


    if (
      state.activeConversationId ===
      conversationId
    ) {

      renderMessages(
        conversationId
      );

      scrollMessagesToBottom();
    }
  }


  /* ============================================================
     FEATURE: MARK MESSAGES READ
     ============================================================ */

  function markMessagesAsRead(conversationId) {

    const messages =
      getConversationMessages(
        conversationId
      );


    messages.forEach(message => {

      if (
        !isOwnMessage(message) &&
        message.status !== "read"
      ) {

        message.status = "read";
      }

    });


    updateUnreadCount();
  }


  /* ============================================================
     FEATURE: GLOBAL UNREAD COUNT
     ============================================================ */

  function updateUnreadCount() {

    const count =
      getTotalUnread();


    if (!DOM.globalUnread) {
      return;
    }


    DOM.globalUnread.textContent =
      count > 99
        ? "99+"
        : String(count);


    DOM.globalUnread.hidden =
      count <= 0;


    DOM.globalUnread.setAttribute(
      "data-count",
      String(count)
    );
  }


  /* ============================================================
     FEATURE: TYPING INDICATOR
     ============================================================ */

  function updateTyping(value) {

    state.typing =
      !!value;


    renderTypingIndicator(
      state.typing
    );


    clearTimeout(
      state.typingTimer
    );


    if (state.typing) {

      state.typingTimer =
        setTimeout(() => {

          updateTyping(false);

        }, CONFIG.typingTimeout);
    }
  }


  function renderTypingIndicator(show) {

    if (!DOM.typingIndicator) {
      return;
    }


    DOM.typingIndicator.hidden =
      !show;


    if (show) {

      DOM.typingIndicator.innerHTML = `

        <span>
          Typing
        </span>

        <span class="typing-dots">
          <i></i>
          <i></i>
          <i></i>
        </span>

      `;
    }
  }


  /* ============================================================
     FEATURE: MESSAGE INPUT
     ============================================================ */

  function focusMessageInput() {

    if (!DOM.messageInput) {
      return;
    }


    DOM.messageInput.focus();
  }


  function autoResizeInput() {

    if (!DOM.messageInput) {
      return;
    }


    DOM.messageInput.style.height =
      "auto";


    DOM.messageInput.style.height =
      `${Math.min(
        DOM.messageInput.scrollHeight,
        140
      )}px`;
  }


  /* ============================================================
     FEATURE: EMOJI SYSTEM
     ============================================================ */

  const EMOJIS = [
    "😀","😂","😍","🥰","😎",
    "😊","😉","🤔","😢","😭",
    "😡","😱","👍","👎","👏",
    "🙏","❤️","💚","🔥","🎉",
    "✨","⭐","💯","😂","🤣",
    "😇","🤝","💬","📦","🛍️",
    "💰","🚚","✅","❌","⚡"
  ];


  function renderEmojiPicker() {

    if (!DOM.emojiPicker) {
      return;
    }


    DOM.emojiPicker.innerHTML = `

      <div class="emoji-grid">

        ${EMOJIS.map(
          emoji => `
            <button
              type="button"
              class="emoji-item"
              data-emoji="${escapeAttribute(
                emoji
              )}"
            >
              ${emoji}
            </button>
          `
        ).join("")}

      </div>

    `;
  }


  function toggleEmojiPicker() {

    if (!DOM.emojiPicker) {
      return;
    }


    const hidden =
      DOM.emojiPicker.hidden;


    DOM.emojiPicker.hidden =
      !hidden;


    if (!hidden) {
      return;
    }


    renderEmojiPicker();
  }


  function insertEmoji(emoji) {

    if (!DOM.messageInput) {
      return;
    }


    const input =
      DOM.messageInput;


    const start =
      input.selectionStart ??
      input.value.length;


    const end =
      input.selectionEnd ??
      input.value.length;


    input.value =
      input.value.substring(0, start) +
      emoji +
      input.value.substring(end);


    input.focus();


    const cursor =
      start + emoji.length;


    input.setSelectionRange(
      cursor,
      cursor
    );


    autoResizeInput();

    updateTyping(true);
  }


  /* ============================================================
     FEATURE: FILE ATTACHMENTS
     ============================================================ */

  function openAttachmentPicker() {

    if (!DOM.fileInput) {

      showToast(
        "File input is not available.",
        "error"
      );

      return;
    }


    DOM.fileInput.click();
  }


  async function handleAttachment(
    event
  ) {

    const file =
      event.target?.files?.[0];


    if (!file) {
      return;
    }


    if (
      file.size >
      CONFIG.maxFileSize
    ) {

      showToast(
        `File is too large. Maximum size is ${formatFileSize(
          CONFIG.maxFileSize
        )}.`,
        "error"
      );

      resetFileInput();

      return;
    }


    const isImage =
      file.type.startsWith("image/");


    const isPDF =
      file.type === "application/pdf";


    const isAllowed =
      isImage ||
      isPDF ||
      file.type.startsWith("text/") ||
      file.type.includes("document") ||
      file.type.includes("spreadsheet") ||
      file.type.includes("presentation") ||
      file.type === "application/zip";


    if (!isAllowed) {

      showToast(
        "This file type is not supported.",
        "error"
      );

      resetFileInput();

      return;
    }


    if (
      isImage &&
      file.size >
      CONFIG.maxImageSize
    ) {

      showToast(
        "Image is larger than 10 MB.",
        "error"
      );

      resetFileInput();

      return;
    }


    let previewUrl = "";


    if (isImage) {

      previewUrl =
        URL.createObjectURL(file);
    }


    state.selectedAttachment = {

      file,

      name:
        file.name,

      fileName:
        file.name,

      size:
        file.size,

      fileSize:
        file.size,

      mimeType:
        file.type,

      type:
        isImage
          ? "image"
          : "file",

      previewUrl,

      url:
        previewUrl

    };


    renderAttachmentPreview();

    showToast(
      "Attachment added.",
      "success"
    );
  }


  function renderAttachmentPreview() {

    if (!DOM.attachmentPreview) {
      return;
    }


    const attachment =
      state.selectedAttachment;


    if (!attachment) {

      DOM.attachmentPreview.innerHTML = "";
      DOM.attachmentPreview.hidden = true;

      return;
    }


    DOM.attachmentPreview.hidden =
      false;


    DOM.attachmentPreview.innerHTML = `

      <div class="attachment-preview-card">

        ${
          attachment.type === "image"
            ? `
              <div class="attachment-preview-image">
                <img
                  src="${escapeAttribute(
                    attachment.previewUrl
                  )}"
                  alt="${escapeAttribute(
                    attachment.fileName
                  )}"
                >
              </div>
            `
            : `
              <div class="attachment-preview-file-icon">
                📄
              </div>
            `
        }


        <div class="attachment-preview-info">

          <strong>
            ${escapeHTML(
              attachment.fileName
            )}
          </strong>

          <small>
            ${formatFileSize(
              attachment.fileSize
            )}
          </small>

        </div>


        <button
          type="button"
          data-action="remove-attachment"
          title="Remove attachment"
          aria-label="Remove attachment"
        >
          ×
        </button>

      </div>

    `;
  }


  function clearAttachment() {

    if (
      state.selectedAttachment?.previewUrl
    ) {

      try {

        URL.revokeObjectURL(
          state.selectedAttachment.previewUrl
        );

      } catch {}
    }


    state.selectedAttachment =
      null;


    renderAttachmentPreview();

    resetFileInput();
  }


  function resetFileInput() {

    if (DOM.fileInput) {
      DOM.fileInput.value = "";
    }
  }


  /* ============================================================
     FEATURE: REPLY
     ============================================================ */

  function startReply(messageId) {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const message =
      getConversationMessages(
        conversation.id
      ).find(
        item => item.id === messageId
      );


    if (!message) {
      return;
    }


    state.replyTo =
      message;


    renderReplyPreview();

    focusMessageInput();
  }


  function renderReplyPreview() {

    if (!DOM.replyPreview) {
      return;
    }


    if (!state.replyTo) {

      DOM.replyPreview.innerHTML = "";
      DOM.replyPreview.hidden = true;

      return;
    }


    DOM.replyPreview.hidden =
      false;


    DOM.replyPreview.innerHTML = `

      <div class="reply-preview-inner">

        <div>

          <strong>
            Replying to
            ${escapeHTML(
              state.replyTo.senderName || ""
            )}
          </strong>

          <span>
            ${escapeHTML(
              state.replyTo.text ||
              state.replyTo.fileName ||
              "Attachment"
            )}
          </span>

        </div>


        <button
          type="button"
          data-action="cancel-reply"
          aria-label="Cancel reply"
        >
          ×
        </button>

      </div>

    `;
  }


  function clearReply() {

    state.replyTo =
      null;


    renderReplyPreview();
  }


  /* ============================================================
     FEATURE: PRODUCT / ORDER CONTEXT
     ============================================================ */

  function setProductContext(product) {

    if (!product) {
      return;
    }


    state.selectedProduct = {
      id:
        product.id ||
        product.productId ||
        "",

      title:
        product.title ||
        product.name ||
        "Product",

      price:
        product.price ||
        product.salePrice ||
        "",

      image:
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        "",

      url:
        product.url ||
        product.link ||
        "#"

    };


    const conversation =
      getActiveConversation();


    if (conversation) {
      renderProductContext(
        conversation
      );
    }
  }


  function clearSelectedProduct() {

    state.selectedProduct =
      null;


    const conversation =
      getActiveConversation();


    if (conversation) {
      renderProductContext(
        conversation
      );
    }
  }


  function setOrderContext(order) {

    if (!order) {
      return;
    }


    state.selectedOrder = {
      ...order
    };


    const conversation =
      getActiveConversation();


    if (conversation) {
      renderOrderContext(
        conversation
      );
    }
  }


  function clearSelectedOrder() {

    state.selectedOrder =
      null;


    const conversation =
      getActiveConversation();


    if (conversation) {
      renderOrderContext(
        conversation
      );
    }
  }


  function clearSelectedContext() {

    clearSelectedProduct();

    clearSelectedOrder();
  }


  /* ============================================================
     FEATURE: OFFER SYSTEM
     ============================================================ */

  function openOfferModal() {

    if (!DOM.offerModal) {

      showToast(
        "Offer feature UI is not available.",
        "warning"
      );

      return;
    }


    DOM.offerModal.hidden =
      false;
  }


  function closeOfferModal() {

    if (DOM.offerModal) {
      DOM.offerModal.hidden = true;
    }
  }


  function sendOffer(price, note = "") {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const offer = {

      id:
        `offer-${Date.now()}`,

      price:
        String(price || "").trim(),

      note:
        String(note || "").trim(),

      status:
        "pending",

      createdAt:
        Date.now()

    };


    const message = {

      id:
        `offer-message-${Date.now()}`,

      senderId:
        state.currentUser?.id,

      senderName:
        state.currentUser?.name || "You",

      type:
        "text",

      text:
        "I sent you a custom offer.",

      offer,

      timestamp:
        Date.now(),

      status:
        "sending"

    };


    state.messages[
      conversation.id
    ].push(message);


    conversation.lastMessage =
      `Offer: ${offer.price}`;


    conversation.lastMessageAt =
      Date.now();


    renderMessages(
      conversation.id
    );


    renderConversations();


    closeOfferModal();

    showToast(
      "Offer sent.",
      "success"
    );


    simulateMessageDelivery(
      conversation.id,
      message.id
    );
  }


  function updateOfferStatus(
    offerId,
    status
  ) {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const messages =
      getConversationMessages(
        conversation.id
      );


    const message =
      messages.find(
        item =>
          item.offer?.id === offerId
      );


    if (!message?.offer) {
      return;
    }


    message.offer.status =
      status;


    renderMessages(
      conversation.id
    );


    showToast(
      status === "accepted"
        ? "Offer accepted."
        : "Offer rejected.",
      status === "accepted"
        ? "success"
        : "warning"
    );
  }


  /* ============================================================
     FEATURE: COPY MESSAGE
     ============================================================ */

  async function copyMessage(messageId) {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const message =
      getConversationMessages(
        conversation.id
      ).find(
        item => item.id === messageId
      );


    if (!message) {
      return;
    }


    const text =
      message.text ||
      message.fileName ||
      "";


    if (!text) {

      showToast(
        "Nothing to copy.",
        "warning"
      );

      return;
    }


    try {

      await navigator.clipboard.writeText(
        text
      );


      showToast(
        "Message copied.",
        "success"
      );

    } catch {

      showToast(
        "Could not copy message.",
        "error"
      );
    }
  }


  /* ============================================================
     FEATURE: DELETE OWN MESSAGE
     ============================================================ */

  function deleteMessage(messageId) {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const messages =
      getConversationMessages(
        conversation.id
      );


    const index =
      messages.findIndex(
        message =>
          message.id === messageId
      );


    if (index === -1) {
      return;
    }


    const message =
      messages[index];


    if (!isOwnMessage(message)) {

      showToast(
        "You can only delete your own messages.",
        "error"
      );

      return;
    }


    const confirmed =
      window.confirm(
        "Delete this message?"
      );


    if (!confirmed) {
      return;
    }


    messages.splice(
      index,
      1
    );


    const last =
      messages[messages.length - 1];


    conversation.lastMessage =
      last
        ? getMessagePreview(last)
        : "";


    conversation.lastMessageAt =
      last
        ? last.timestamp
        : Date.now();


    renderMessages(
      conversation.id
    );


    renderConversations();

    saveUIState();


    showToast(
      "Message deleted.",
      "success"
    );
  }


  /* ============================================================
     FEATURE: MARK UNREAD
     ============================================================ */

  function markConversationUnread() {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    conversation.unread =
      Math.max(
        1,
        Number(conversation.unread || 0)
      );


    renderConversations();

    updateUnreadCount();

    saveUIState();


    showToast(
      "Conversation marked as unread.",
      "success"
    );
  }


  /* ============================================================
     FEATURE: MUTE
     ============================================================ */

  function toggleMuteConversation() {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const currentlyMuted =
      state.mutedConversations.has(
        conversation.id
      );


    if (currentlyMuted) {

      state.mutedConversations.delete(
        conversation.id
      );

      conversation.muted =
        false;

      showToast(
        "Conversation unmuted.",
        "success"
      );

    } else {

      state.mutedConversations.add(
        conversation.id
      );

      conversation.muted =
        true;

      showToast(
        "Conversation muted.",
        "success"
      );
    }


    renderConversations();

    saveUIState();
  }


  /* ============================================================
     FEATURE: ARCHIVE
     ============================================================ */

  function toggleArchiveConversation() {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const archived =
      state.archivedConversations.has(
        conversation.id
      );


    if (archived) {

      state.archivedConversations.delete(
        conversation.id
      );

      conversation.archived =
        false;

      showToast(
        "Conversation restored.",
        "success"
      );

    } else {

      state.archivedConversations.add(
        conversation.id
      );

      conversation.archived =
        true;

      showToast(
        "Conversation archived.",
        "success"
      );
    }


    renderConversations();

    saveUIState();
  }


  /* ============================================================
     FEATURE: BLOCK USER
     ============================================================ */

  function toggleBlockUser() {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const userId =
      conversation.participantId;


    const blocked =
      state.blockedUsers.has(
        userId
      );


    if (blocked) {

      state.blockedUsers.delete(
        userId
      );


      showToast(
        "User unblocked.",
        "success"
      );

    } else {

      const confirmed =
        window.confirm(
          `Block ${conversation.participantName}?`
        );


      if (!confirmed) {
        return;
      }


      state.blockedUsers.add(
        userId
      );


      showToast(
        "User blocked.",
        "success"
      );
    }


    saveUIState();
  }


  /* ============================================================
     FEATURE: CLEAR CHAT
     ============================================================ */

  function clearChat() {

    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    const confirmed =
      window.confirm(
        "Clear all messages from this conversation?"
      );


    if (!confirmed) {
      return;
    }


    state.messages[
      conversation.id
    ] = [];


    conversation.lastMessage =
      "";


    conversation.lastMessageAt =
      Date.now();


    renderMessages(
      conversation.id
    );


    renderConversations();

    saveUIState();


    showToast(
      "Conversation cleared.",
      "success"
    );
  }


  /* ============================================================
     FEATURE: REPORT SYSTEM
     ============================================================ */

  function openReportModal(
    messageId = null
  ) {

    if (!DOM.reportModal) {

      showToast(
        "Report interface is not available.",
        "warning"
      );

      return;
    }


    DOM.reportModal.dataset.messageId =
      messageId || "";


    DOM.reportModal.hidden =
      false;
  }


  function closeReportModal() {

    if (DOM.reportModal) {
      DOM.reportModal.hidden = true;
    }
  }


  function submitReport(
    category,
    details = ""
  ) {

    const conversation =
      getActiveConversation();


    const messageId =
      DOM.reportModal?.dataset?.messageId ||
      "";


    const report = {

      conversationId:
        conversation?.id || "",

      messageId,

      category:
        category || "other",

      details:
        details || "",

      createdAt:
        Date.now()

    };


    /*
      IMPORTANT:
      Real report submission should later be connected
      to the project's existing admin/moderation architecture.
      No Firebase path is invented here.
    */


    console.log(
      "Messaging report queued:",
      report
    );


    closeReportModal();


    showToast(
      "Report submitted.",
      "success"
    );
  }


  /* ============================================================
     FEATURE: IMAGE PREVIEW
     ============================================================ */

  function openImagePreview(url) {

    if (!url) {
      return;
    }


    if (!DOM.imagePreviewModal) {

      window.open(
        url,
        "_blank",
        "noopener"
      );

      return;
    }


    DOM.imagePreviewModal.hidden =
      false;


    const image =
      $("img", DOM.imagePreviewModal);


    if (image) {
      image.src = url;
    }
  }


  function closeImagePreview() {

    if (DOM.imagePreviewModal) {
      DOM.imagePreviewModal.hidden = true;
    }
  }


  /* ============================================================
     FEATURE: FILE PREVIEW
     ============================================================ */

  function openFilePreview(url) {

    if (!url) {

      showToast(
        "File preview is not available.",
        "warning"
      );

      return;
    }


    if (
      DOM.filePreviewModal
    ) {

      DOM.filePreviewModal.hidden =
        false;


      const frame =
        $("iframe",
          DOM.filePreviewModal);


      if (frame) {
        frame.src = url;
      }

      return;
    }


    window.open(
      url,
      "_blank",
      "noopener"
    );
  }


  function closeFilePreview() {

    if (DOM.filePreviewModal) {
      DOM.filePreviewModal.hidden = true;
    }
  }


  /* ============================================================
     FEATURE: CHAT SEARCH
     ============================================================ */

  function toggleChatSearch() {

    state.isChatSearchOpen =
      !state.isChatSearchOpen;


    const searchContainer =
      $(".chat-search") ||
      byId("chatSearch");


    if (searchContainer) {

      searchContainer.hidden =
        !state.isChatSearchOpen;

      if (
        state.isChatSearchOpen
      ) {

        const input =
          $("input",
            searchContainer);

        input?.focus();
      }
    }
  }


  function searchMessages(value) {

    state.messageSearch =
      String(value || "");


    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    renderMessages(
      conversation.id
    );
  }


  /* ============================================================
     FEATURE: NEW MESSAGE
     ============================================================ */

  function openNewMessageModal() {

    if (!DOM.newMessageModal) {

      showToast(
        "New message interface is not available.",
        "warning"
      );

      return;
    }


    DOM.newMessageModal.hidden =
      false;


    const input =
      $("input",
        DOM.newMessageModal);


    input?.focus();
  }


  function closeNewMessageModal() {

    if (DOM.newMessageModal) {
      DOM.newMessageModal.hidden =
        true;
    }
  }


  /* ============================================================
     FEATURE: CREATE LOCAL CONVERSATION
     
     Temporary UI behavior.
     Real participant lookup will later use the actual user
     system.
     ============================================================ */

  function createConversation(
    participant
  ) {

    if (!participant) {
      return null;
    }


    const id =
      participant.id ||
      `conversation-${Date.now()}`;


    let conversation =
      getConversation(id);


    if (conversation) {

      openConversation(
        conversation.id
      );

      return conversation;
    }


    conversation = {

      id,

      type:
        participant.type ||
        "buyer",

      participantId:
        participant.id ||
        id,

      participantName:
        participant.name ||
        "User",

      participantRole:
        participant.role ||
        "User",

      avatar:
        participant.avatar ||
        "",

      online:
        !!participant.online,

      lastSeen:
        participant.lastSeen ||
        Date.now(),

      unread:
        0,

      muted:
        false,

      archived:
        false,

      product:
        participant.product ||
        null,

      order:
        participant.order ||
        null,

      lastMessage:
        "",

      lastMessageAt:
        Date.now()

    };


    state.conversations.unshift(
      conversation
    );


    state.messages[
      conversation.id
    ] = [];


    renderConversations();

    openConversation(
      conversation.id
    );


    return conversation;
  }


  /* ============================================================
     FEATURE: MOBILE CHAT
     ============================================================ */

  function updateMobileChatState(
    open
  ) {

    state.isChatOpen =
      !!open;


    if (!DOM.app) {
      return;
    }


    DOM.app.classList.toggle(
      "chat-open",
      state.isChatOpen
    );
  }


  function closeMobileChat() {

    state.isChatOpen =
      false;


    updateMobileChatState(
      false
    );


    state.activeConversationId =
      state.activeConversationId;
  }


  /* ============================================================
     FEATURE: SCROLL
     ============================================================ */

  function scrollMessagesToBottom(
    smooth = true
  ) {

    if (!DOM.chatMessages) {
      return;
    }


    DOM.chatMessages.scrollTo({
      top:
        DOM.chatMessages.scrollHeight,

      behavior:
        smooth
          ? "smooth"
          : "auto"
    });
  }


  /* ============================================================
     FEATURE: CHAT INFO
     ============================================================ */

  function toggleChatInfo() {

    state.isChatInfoOpen =
      !state.isChatInfoOpen;


    if (DOM.chatInfo) {

      DOM.chatInfo.hidden =
        !state.isChatInfoOpen;


      if (
        state.isChatInfoOpen
      ) {

        renderChatInfo();
      }
    }
  }


  function renderChatInfo() {

    if (!DOM.chatInfo) {
      return;
    }


    const conversation =
      getActiveConversation();


    if (!conversation) {
      return;
    }


    DOM.chatInfo.innerHTML = `

      <div class="chat-info-header">

        <strong>
          Chat Information
        </strong>

        <button
          type="button"
          data-action="close-chat-info"
        >
          ×
        </button>

      </div>


      <div class="chat-info-profile">

        <div class="chat-info-avatar">
          ${
            conversation.participantName
              ?.charAt(0)
              .toUpperCase() || "?"
          }
        </div>

        <strong>
          ${escapeHTML(
            conversation.participantName
          )}
        </strong>

        <span>
          ${escapeHTML(
            conversation.participantRole || ""
          )}
        </span>

      </div>


      ${
        conversation.product
          ? `
            <div class="chat-info-section">

              <small>Product</small>

              <strong>
                ${escapeHTML(
                  conversation.product.title
                )}
              </strong>

            </div>
          `
          : ""
      }


      ${
        conversation.order
          ? `
            <div class="chat-info-section">

              <small>Order</small>

              <strong>
                ${escapeHTML(
                  conversation.order.id
                )}
              </strong>

              <span>
                ${escapeHTML(
                  conversation.order.status || ""
                )}
              </span>

            </div>
          `
          : ""
      }


      <div class="chat-info-actions">

        <button
          type="button"
          data-action="toggle-mute"
        >
          ${
            state.mutedConversations.has(
              conversation.id
            )
              ? "Unmute"
              : "Mute"
          }
        </button>

        <button
          type="button"
          data-action="toggle-archive"
        >
          ${
            state.archivedConversations.has(
              conversation.id
            )
              ? "Unarchive"
              : "Archive"
          }
        </button>

        <button
          type="button"
          data-action="mark-unread"
        >
          Mark Unread
        </button>

        <button
          type="button"
          data-action="block-user"
          class="danger"
        >
          ${
            state.blockedUsers.has(
              conversation.participantId
            )
              ? "Unblock"
              : "Block"
          }
        </button>

        <button
          type="button"
          data-action="report-user"
          class="danger"
        >
          Report User
        </button>

      </div>

    `;
  }


  /* ============================================================
     FEATURE: CHAT OPTIONS
     ============================================================ */

  function toggleChatOptions() {

    state.isChatOptionsOpen =
      !state.isChatOptionsOpen;


    if (DOM.chatOptions) {

      DOM.chatOptions.hidden =
        !state.isChatOptionsOpen;
    }
  }


  function closeChatOptions() {

    state.isChatOptionsOpen =
      false;


    if (DOM.chatOptions) {
      DOM.chatOptions.hidden =
        true;
    }
  }


  /* ============================================================
     FEATURE: VOICE / VIDEO UI
     ============================================================ */

  function startVoiceCall() {

    showToast(
      "Voice call interface is ready. Call service will be connected later.",
      "info"
    );
  }


  function startVideoCall() {

    showToast(
      "Video call interface is ready. Call service will be connected later.",
      "info"
    );
  }


  /* ============================================================
     FEATURE: NOTIFICATION
     ============================================================ */

  function showToast(
    message,
    type = "info"
  ) {

    if (!DOM.toast) {

      console.log(
        `[${type}] ${message}`
      );

      return;
    }


    clearTimeout(
      state.toastTimer
    );


    DOM.toast.textContent =
      message;


    DOM.toast.className =
      `message-toast ${type}`;


    DOM.toast.hidden =
      false;


    requestAnimationFrame(() => {

      DOM.toast.classList.add(
        "show"
      );

    });


    state.toastTimer =
      setTimeout(() => {

        DOM.toast.classList.remove(
          "show"
        );

        setTimeout(() => {

          DOM.toast.hidden =
            true;

        }, 250);

      }, CONFIG.toastDuration);
  }


  /* ============================================================
     FEATURE: EVENT DELEGATION
     ============================================================ */

  function handleClick(event) {

    const target =
      event.target;


    /* Conversation */
    const conversationItem =
      target.closest(
        "[data-conversation-id]"
      );


    if (
      conversationItem &&
      (
        conversationItem.classList.contains(
          "conversation-item"
        ) ||
        conversationItem.dataset.conversationId
      )
    ) {

      openConversation(
        conversationItem.dataset.conversationId
      );

      return;
    }


    /* Generic actions */
    const actionElement =
      target.closest(
        "[data-action]"
      );


    if (!actionElement) {
      return;
    }


    const action =
      actionElement.dataset.action;


    const messageId =
      actionElement.dataset.messageId;


    switch (action) {

      case "chat-search":
        toggleChatSearch();
        break;


      case "chat-info":
        toggleChatInfo();
        break;


      case "chat-options":
        toggleChatOptions();
        break;


      case "close-chat-info":

        state.isChatInfoOpen =
          false;

        if (DOM.chatInfo) {
          DOM.chatInfo.hidden =
            true;
        }

        break;


      case "close-chat-options":
        closeChatOptions();
        break;


      case "voice-call":
        startVoiceCall();
        break;


      case "video-call":
        startVideoCall();
        break;


      case "reply-message":
        startReply(messageId);
        break;


      case "copy-message":
        copyMessage(messageId);
        break;


      case "delete-message":
        deleteMessage(messageId);
        break;


      case "report-message":
        openReportModal(messageId);
        break;


      case "report-user":
        openReportModal();
        break;


      case "mark-unread":
        markConversationUnread();
        break;


      case "toggle-mute":
        toggleMuteConversation();
        break;


      case "toggle-archive":
        toggleArchiveConversation();
        break;


      case "block-user":
        toggleBlockUser();
        break;


      case "clear-chat":
        clearChat();
        break;


      case "remove-attachment":
        clearAttachment();
        break;


      case "cancel-reply":
        clearReply();
        break;


      case "preview-image":
        openImagePreview(
          actionElement.dataset.imageUrl
        );
        break;


      case "preview-file":
        openFilePreview(
          actionElement.dataset.fileUrl
        );
        break;


      case "accept-offer":
        updateOfferStatus(
          actionElement.dataset.offerId,
          "accepted"
        );
        break;


      case "reject-offer":
        updateOfferStatus(
          actionElement.dataset.offerId,
          "rejected"
        );
        break;


      case "close-image-preview":
        closeImagePreview();
        break;


      case "close-file-preview":
        closeFilePreview();
        break;


      case "close-report":
        closeReportModal();
        break;


      case "close-offer":
        closeOfferModal();
        break;


      case "close-new-message":
        closeNewMessageModal();
        break;


      case "mobile-back":
        closeMobileChat();
        break;


      case "new-message":
        openNewMessageModal();
        break;


      case "send-message":
        sendMessage();
        break;


      case "open-offer":
        openOfferModal();
        break;

    }
  }


  /* ============================================================
     FEATURE: FILTER EVENTS
     ============================================================ */

  function handleFilterClick(
    event
  ) {

    const element =
      event.target.closest(
        "[data-message-filter], " +
        "[data-filter], " +
        ".message-filter"
      );


    if (!element) {
      return;
    }


    const filter =
      element.dataset.messageFilter ||
      element.dataset.filter ||
      element.dataset.type ||
      "all";


    state.activeFilter =
      String(filter).toLowerCase();


    DOM.filterButtons.forEach(
      button => {

        const buttonFilter =
          button.dataset.messageFilter ||
          button.dataset.filter ||
          button.dataset.type;

        button.classList.toggle(
          "active",
          buttonFilter ===
          state.activeFilter
        );

      }
    );


    renderConversations();

    saveUIState();
  }


  /* ============================================================
     FEATURE: INPUT EVENTS
     ============================================================ */

  function handleInput(event) {

    const target =
      event.target;


    if (
      target ===
      DOM.conversationSearch
    ) {

      state.conversationSearch =
        target.value;

      renderConversations();

      return;
    }


    if (
      target ===
      DOM.messageSearch
    ) {

      searchMessages(
        target.value
      );

      return;
    }


    if (
      target ===
      DOM.messageInput
    ) {

      autoResizeInput();

      updateTyping(
        target.value.trim().length > 0
      );
    }
  }


  /* ============================================================
     FEATURE: KEYBOARD EVENTS
     ============================================================ */

  function handleKeyDown(event) {

    if (
      event.target ===
      DOM.messageInput
    ) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

        return;
      }
    }


    if (
      event.key === "Escape"
    ) {

      closeAllOverlays();
    }
  }


  /* ============================================================
     FEATURE: FILE EVENT
     ============================================================ */

  function handleChange(event) {

    if (
      event.target ===
      DOM.fileInput
    ) {

      handleAttachment(
        event
      );
    }
  }


  /* ============================================================
     FEATURE: OUTSIDE CLICK
     ============================================================ */

  function handleDocumentClick(
    event
  ) {

    const target =
      event.target;


    if (
      DOM.emojiPicker &&
      !DOM.emojiPicker.hidden &&
      !target.closest(".emoji-picker") &&
      !target.closest("[data-action='emoji']")
    ) {

      DOM.emojiPicker.hidden =
        true;
    }


    if (
      DOM.chatOptions &&
      !DOM.chatOptions.hidden &&
      !target.closest(".chat-options-menu") &&
      !target.closest("[data-action='chat-options']")
    ) {

      closeChatOptions();
    }
  }


  /* ============================================================
     FEATURE: EMOJI CLICK
     ============================================================ */

  function handleEmojiClick(
    event
  ) {

    const button =
      event.target.closest(
        "[data-emoji]"
      );


    if (!button) {
      return;
    }


    insertEmoji(
      button.dataset.emoji
    );
  }


  /* ============================================================
     FEATURE: CLOSE OVERLAYS
     ============================================================ */

  function closeAllOverlays() {

    if (DOM.emojiPicker) {
      DOM.emojiPicker.hidden =
        true;
    }


    if (DOM.reportModal) {
      DOM.reportModal.hidden =
        true;
    }


    if (DOM.offerModal) {
      DOM.offerModal.hidden =
        true;
    }


    if (DOM.newMessageModal) {
      DOM.newMessageModal.hidden =
        true;
    }


    if (DOM.imagePreviewModal) {
      DOM.imagePreviewModal.hidden =
        true;
    }


    if (DOM.filePreviewModal) {
      DOM.filePreviewModal.hidden =
        true;
    }


    if (DOM.chatInfo) {
      DOM.chatInfo.hidden =
        true;
    }


    closeChatOptions();
  }


  /* ============================================================
     FEATURE: EVENT BINDING
     ============================================================ */

  function bindEvents() {

    document.addEventListener(
      "click",
      handleClick
    );


    document.addEventListener(
      "click",
      handleFilterClick
    );


    document.addEventListener(
      "click",
      handleEmojiClick
    );


    document.addEventListener(
      "click",
      handleDocumentClick
    );


    document.addEventListener(
      "input",
      handleInput
    );


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    document.addEventListener(
      "change",
      handleChange
    );


    /* Dedicated send button */
    DOM.sendButton?.addEventListener(
      "click",
      sendMessage
    );


    /* Emoji */
    DOM.emojiButton?.addEventListener(
      "click",
      toggleEmojiPicker
    );


    /* Attachment */
    DOM.attachmentButton?.addEventListener(
      "click",
      openAttachmentPicker
    );


    /* Mobile back */
    DOM.mobileBack?.addEventListener(
      "click",
      closeMobileChat
    );
  }


  /* ============================================================
     FEATURE: PENDING PRODUCT CHAT
     ============================================================ */

  function restorePendingProductChat() {

    try {

      const raw =
        sessionStorage.getItem(
          CONFIG.pendingProductKey
        );


      if (!raw) {
        return;
      }


      sessionStorage.removeItem(
        CONFIG.pendingProductKey
      );


      const product =
        JSON.parse(raw);


      if (product) {

        setProductContext(
          product
        );


        /*
          If a seller conversation ID is supplied by the
          existing system, use it.
        */
        if (
          product.conversationId
        ) {

          openConversation(
            product.conversationId
          );

        } else if (
          product.sellerId
        ) {

          /*
            Do not invent Firebase records here.
            If a conversation doesn't already exist,
            create a local temporary conversation.
          */

          const existing =
            state.conversations.find(
              conversation =>
                conversation.participantId ===
                product.sellerId
            );


          if (existing) {

            openConversation(
              existing.id
            );

          } else {

            createConversation({
              id:
                product.sellerId,

              name:
                product.sellerName ||
                "Seller",

              role:
                "Seller",

              type:
                "seller",

              product,

              online:
                false
            });
          }
        }
      }

    } catch (error) {

      console.warn(
        "Pending product chat could not be restored.",
        error
      );
    }
  }


  /* ============================================================
     FEATURE: PENDING ORDER CHAT
     ============================================================ */

  function restorePendingOrderChat() {

    try {

      const raw =
        sessionStorage.getItem(
          CONFIG.pendingOrderKey
        );


      if (!raw) {
        return;
      }


      sessionStorage.removeItem(
        CONFIG.pendingOrderKey
      );


      const order =
        JSON.parse(raw);


      if (!order) {
        return;
      }


      setOrderContext(
        order
      );


      if (
        order.conversationId
      ) {

        openConversation(
          order.conversationId
        );

      }

    } catch (error) {

      console.warn(
        "Pending order chat could not be restored.",
        error
      );
    }
  }


  /* ============================================================
     FEATURE: PUBLIC PRODUCT CHAT BRIDGE
     
     Product Details page can call:
     
     window.openProductChat(product)
     
     ============================================================ */

  function openProductChat(product) {

    if (!product) {
      return;
    }


    try {

      sessionStorage.setItem(
        CONFIG.pendingProductKey,
        JSON.stringify(product)
      );

    } catch (error) {

      console.warn(
        "Could not save pending product chat.",
        error
      );
    }


    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    if (
      currentPage !==
      "messages.html"
    ) {

      window.location.href =
        "messages.html";

      return;
    }


    setProductContext(
      product
    );


    if (
      product.conversationId
    ) {

      openConversation(
        product.conversationId
      );
    }
  }


  /* ============================================================
     FEATURE: PUBLIC ORDER CHAT BRIDGE
     ============================================================ */

  function openOrderChat(order) {

    if (!order) {
      return;
    }


    try {

      sessionStorage.setItem(
        CONFIG.pendingOrderKey,
        JSON.stringify(order)
      );

    } catch (error) {

      console.warn(
        "Could not save pending order chat.",
        error
      );
    }


    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    if (
      currentPage !==
      "messages.html"
    ) {

      window.location.href =
        "messages.html";

      return;
    }


    setOrderContext(
      order
    );


    if (
      order.conversationId
    ) {

      openConversation(
        order.conversationId
      );
    }
  }


  /* ============================================================
     FEATURE: PROGRAMMATIC MESSAGE API
     ============================================================ */

  function addIncomingMessage(
    conversationId,
    data
  ) {

    const conversation =
      getConversation(
        conversationId
      );


    if (!conversation) {
      return null;
    }


    const message = {

      id:
        data.id ||
        `incoming-${Date.now()}`,

      senderId:
        data.senderId ||
        conversation.participantId,

      senderName:
        data.senderName ||
        conversation.participantName,

      type:
        data.type ||
        "text",

      text:
        data.text ||
        "",

      timestamp:
        data.timestamp ||
        Date.now(),

      status:
        "delivered",

      ...data

    };


    if (!state.messages[
      conversationId
    ]) {

      state.messages[
        conversationId
      ] = [];
    }


    state.messages[
      conversationId
    ].push(message);


    conversation.lastMessage =
      getMessagePreview(
        message
      );


    conversation.lastMessageAt =
      message.timestamp;


    if (
      state.activeConversationId ===
      conversationId
    ) {

      message.status =
        "read";

      conversation.unread =
        0;

      renderMessages(
        conversationId
      );

      scrollMessagesToBottom();

    } else {

      conversation.unread =
        Number(
          conversation.unread || 0
        ) + 1;


      showToast(
        `New Message — ${conversation.participantName} sent you a message.`,
        "info"
      );
    }


    renderConversations();

    updateUnreadCount();

    return message;
  }


  /* ============================================================
     FEATURE: SYSTEM MESSAGE API
     ============================================================ */

  function addSystemMessage(
    conversationId,
    text,
    extra = {}
  ) {

    const conversation =
      getConversation(
        conversationId
      );


    if (!conversation) {
      return null;
    }


    const message = {

      id:
        `system-${Date.now()}`,

      senderId:
        "system",

      senderName:
        "SmartBazaar",

      type:
        "system",

      text:
        text || "",

      timestamp:
        Date.now(),

      status:
        "read",

      ...extra

    };


    if (!state.messages[
      conversationId
    ]) {

      state.messages[
        conversationId
      ] = [];
    }


    state.messages[
      conversationId
    ].push(message);


    conversation.lastMessage =
      text;


    conversation.lastMessageAt =
      message.timestamp;


    if (
      state.activeConversationId ===
      conversationId
    ) {

      renderMessages(
        conversationId
      );

      scrollMessagesToBottom();

    } else {

      conversation.unread =
        Number(
          conversation.unread || 0
        ) + 1;
    }


    renderConversations();

    updateUnreadCount();


    return message;
  }


  /* ============================================================
     FEATURE: SET CONVERSATIONS
     ============================================================ */

  function setConversations(
    conversations
  ) {

    if (
      !Array.isArray(
        conversations
      )
    ) {
      return;
    }


    state.conversations =
      conversations.map(
        conversation => ({
          unread: 0,
          muted: false,
          archived: false,
          ...conversation
        })
      );


    renderConversations();

    updateUnreadCount();
  }


  /* ============================================================
     FEATURE: SET MESSAGES
     ============================================================ */

  function setMessages(
    conversationId,
    messages
  ) {

    if (!conversationId) {
      return;
    }


    state.messages[
      conversationId
    ] = Array.isArray(messages)
      ? messages
      : [];


    if (
      state.activeConversationId ===
      conversationId
    ) {

      renderMessages(
        conversationId
      );

      scrollMessagesToBottom(
        false
      );
    }
  }


  /* ============================================================
     FEATURE: SET CURRENT USER
     ============================================================ */

  function setCurrentUser(
    user
  ) {

    if (!user) {
      return;
    }


    state.currentUser = {
      ...state.currentUser,
      ...user
    };


    renderConversations();


    const conversation =
      getActiveConversation();


    if (conversation) {
      renderChatHeader(
        conversation
      );
    }
  }


  /* ============================================================
     FEATURE: INITIALIZATION
     ============================================================ */

  function init(options = {}) {

    if (
      state.initialized
    ) {
      return;
    }


    cacheDOM();

    loadUIState();


    if (
      options.currentUser
    ) {

      setCurrentUser(
        options.currentUser
      );

    } else {

      state.currentUser = {
        ...CONFIG.demoUser
      };
    }


    if (
      Array.isArray(
        options.conversations
      )
    ) {

      setConversations(
        options.conversations
      );

    } else {

      createDemoData();
    }


    if (
      options.messages
    ) {

      Object.assign(
        state.messages,
        options.messages
      );
    }


    bindEvents();


    renderConversations();

    updateUnreadCount();


    restorePendingProductChat();

    restorePendingOrderChat();


    /*
      Restore previous conversation only if it still exists.
    */
    if (
      state.activeConversationId &&
      getConversation(
        state.activeConversationId
      )
    ) {

      openConversation(
        state.activeConversationId
      );
    }


    state.initialized =
      true;


    document.dispatchEvent(
      new CustomEvent(
        "smartbazaar:messages-ready"
      )
    );


    return MessagesApp;
  }


  /* ============================================================
     FEATURE: PUBLIC API
     ============================================================ */

  const MessagesApp = {

    init,

    openConversation,

    createConversation,

    sendMessage,

    addIncomingMessage,

    addSystemMessage,

    setConversations,

    setMessages,

    setCurrentUser,

    setProductContext,

    clearSelectedProduct,

    setOrderContext,

    clearSelectedOrder,

    openProductChat,

    openOrderChat,

    markConversationUnread,

    toggleMuteConversation,

    toggleArchiveConversation,

    toggleBlockUser,

    clearChat,

    startReply,

    clearReply,

    openOfferModal,

    closeOfferModal,

    sendOffer,

    updateOfferStatus,

    openReportModal,

    closeReportModal,

    submitReport,

    openImagePreview,

    closeImagePreview,

    openFilePreview,

    closeFilePreview,

    showToast,

    getState() {

      return {
        ...state,
        blockedUsers:
          Array.from(
            state.blockedUsers
          ),
        mutedConversations:
          Array.from(
            state.mutedConversations
          ),
        archivedConversations:
          Array.from(
            state.archivedConversations
          )
      };
    }

  };


  /* ============================================================
     FEATURE: GLOBAL API
     ============================================================ */

  window.MessagesApp =
    MessagesApp;


  window.openProductChat =
    openProductChat;


  window.openOrderChat =
    openOrderChat;


  /* ============================================================
     FEATURE: AUTO INITIALIZATION
     ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => init()
    );

  } else {

    init();
  }


})();
