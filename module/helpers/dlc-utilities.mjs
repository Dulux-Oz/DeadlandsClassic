export function chatMessage(
  speaker = ChatMessage.getSpeaker(),
  title = 'Message',
  message = 'Forgot something...'
) {
  const chatData = {
    title,
    content: `<div><h2>${title}</h2>${message}</div>`,
    user: game.user.id,
    speaker,
    type: globalThis.CONST.CHAT_MESSAGE_STYLES.OTHER,
  };

  ChatMessage.create(chatData);
}
