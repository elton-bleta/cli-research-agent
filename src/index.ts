import 'dotenv/config';
import { runAgent } from './agent';

async function main(): Promise<void> {
  const question = process.argv.slice(2).join(' ').trim();

  if (!question) {
    console.error('Usage: npm start -- "your question here"');
    process.exit(1);
  }

  console.log(`\n❓ Question: ${question}`);
  console.log('─'.repeat(50));

  try {
    const result = await runAgent(question);

    console.log('─'.repeat(50));
    console.log('\n📋 Answer:\n');
    console.log(result.answer);

    if (result.usedWebSearch && result.sources.length > 0) {
      console.log('\n🔗 Sources retrieved:');
      result.sources.forEach(s => console.log(`  • ${s.title}: ${s.url}`));
    } else if (!result.usedWebSearch) {
      console.log('\n💡 Answered from training knowledge (no web search needed)');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`\n❌ Agent error: ${message}`);
    process.exit(1);
  }
}

main();