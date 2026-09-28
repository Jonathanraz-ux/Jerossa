import { supabase } from '../lib/supabase';

export const createOrGetConversation = async ({ sellerId, productCode, productTitle, subject, message }) => {
  const { data, error } = await supabase.rpc('create_or_get_conversation', {
    p_seller_id: sellerId,
    p_product_code: productCode || null,
    p_product_title: productTitle || null,
    p_subject: subject || '',
    p_message: message || '',
  });
  if (error) {
    console.error('[messages] createOrGetConversation', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

export const sendMessage = async ({ conversationId, content }) => {
  const { data, error } = await supabase.rpc('send_message', {
    p_conversation_id: conversationId,
    p_content: content,
  });
  if (error) {
    console.error('[messages] sendMessage', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

export const markConversationRead = async (conversationId) => {
  const { error } = await supabase.rpc('mark_conversation_read', {
    p_conversation_id: conversationId,
  });
  if (error) {
    console.error('[messages] markConversationRead', error);
  }
};

export const fetchMyConversations = async () => {
  const { data, error } = await supabase.rpc('list_my_conversations');

  if (error) {
    console.error('[messages] fetchMyConversations', error);
    return [];
  }

  return (data || []).map((convo) => ({
    id: convo.id,
    buyerId: convo.buyer_id,
    sellerId: convo.seller_id,
    sellerName: convo.seller_name || '',
    sellerSlug: convo.seller_slug || '',
    sellerLogo: convo.seller_logo || '',
    buyerName: convo.buyer_display_name || '',
    productCode: convo.product_code,
    productTitle: convo.product_title,
    subject: convo.subject,
    lastMessage: convo.last_message || '',
    lastMessageAt: convo.last_message_at,
    unreadCount: Number(convo.unread_count) || 0,
    createdAt: convo.created_at,
  }));
};

export const fetchConversationMessages = async (conversationId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, messages: [] };

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    // `seq` est le tiebreaker : created_at peut être identique pour deux
    // messages insérés dans la même transaction (now() figé au début), ce qui
    // rendrait l'ordre des bulles non déterministe.
    .order('created_at', { ascending: true })
    .order('seq', { ascending: true });

  if (error) {
    console.error('[messages] fetchConversationMessages', error);
    return { ok: false, messages: [] };
  }

  return {
    ok: true,
    messages: (data || []).map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      isOwn: msg.sender_id === user.id,
      content: msg.content,
      isRead: msg.is_read,
      createdAt: msg.created_at,
      seq: msg.seq ?? null,
    })),
  };
};
