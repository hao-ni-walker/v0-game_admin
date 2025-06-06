export async function getGithubStats() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/guizimo/n-admin',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json'
        },
        next: { revalidate: 3600 } // 每小时重新获取一次
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return { stars: 0, forks: 0 };
  }
}
