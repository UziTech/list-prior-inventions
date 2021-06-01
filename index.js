const fetch = require('node-fetch');
const {program} = require('commander');
const {format} = require('date-fns');
const pad = require('pad-right');

program
  .option('-u, --user <type>', '<username>')
  .option('-p, --page <type>', 'page')
program.parse(process.argv);

if (!program.user) {
  console.log('No user input. Please use -u <username>');
  return;
}

async function getPage(page) {
  const url = `https://api.github.com/users/${program.user}/repos?type=owner&sort=created&per_page=100&page=${page}`;
  const res = await fetch(url)
  if (!res.ok) {
    return [];
  }
  const data = await res.json()
  return data;
}

async function run() {
  let end = "more... pages 10";
  const list = [];
  if (program.page) {
    list.push(...await getPage(program.page));
  } else {
    let page = 1;
    while (page <= 10) {
      const data = await getPage(page);
      if (!data.length) {
        end = `done. pages ${page - 1}`;
        break;
      }
      list.push(...data);
      page++;
    }
  }


  for (const repo of list) {
    const name = pad(repo.name, program.namepad ? program.namepad : 50, ' ');
    const date = pad(format(new Date(repo.created_at), "Y-MM-dd"), 12, ' ');

    console.log(`${name} ${date} ${repo.html_url}`);
  }
  console.log(end);
}

run();
