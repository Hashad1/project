export function formatMessage(message: string): string {
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let formattedMessage = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline">$1</a>');

  // Convert markdown-style code blocks
  formattedMessage = formattedMessage.replace(
    /```([^`]+)```/g,
    '<pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>'
  );

  // Convert inline code
  formattedMessage = formattedMessage.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">$1</code>'
  );

  // Convert bullet points
  formattedMessage = formattedMessage.replace(
    /^[•\-\*]\s(.+)$/gm,
    '<div class="flex gap-2 items-start"><span class="text-orange-500 mt-1.5">•</span><span>$1</span></div>'
  );

  // Convert numbered lists
  formattedMessage = formattedMessage.replace(
    /^\d+\.\s(.+)$/gm,
    '<div class="flex gap-2 items-start"><span class="text-orange-500 font-medium min-w-[1.5rem]">$&</span></div>'
  );

  // Add spacing between paragraphs
  formattedMessage = formattedMessage.replace(/\n\n/g, '</p><p class="mt-4">');

  return `<p>${formattedMessage}</p>`;
}