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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('*, producers(name, slug, logo_url)')
    .or(`buyer_id.eq.${user.id},seller_id.in.(select id from producers where user_id = '${user.id}')`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[messages] fetchMyConversations', error);
    return [];
  }

  // Enrich with last message and unread count
  const enriched = await Promise.all((data || []).map(async (convo) => {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content, sender_id, created_at')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unread } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', convo.id)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    return {
      id: convo.id,
      buyerId: convo.buyer_id,
      sellerId: convo.seller_id,
      sellerName: convo.producers?.name || '',
      sellerSlug: convo.producers?.slug || '',
      sellerLogo: convo.producers?.logo_url || '',
      productCode: convo.product_code,
      productTitle: convo.product_title,
      subject: convo.subject,
      lastMessage: lastMsg?.content || '',
      lastMessageAt: lastMsg?.created_at || convo.updated_at,
      unreadCount: unread || 0,
      createdAt: convo.created_at,
    };
  }));

  return enriched;
};

export const fetchConversationMessages = async (conversationId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[messages] fetchConversationMessages', error);
    return [];
  }

  return (data || []).map((msg) => ({
    id: msg.id,
    senderId: msg.sender_id,
    isOwn: msg.sender_id === user.id,
    content: msg.content,
    isRead: msg.is_read,
    createdAt: msg.created_at,
  }));
};
