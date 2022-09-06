import { Octokit } from '@octokit/rest';
import github from '@actions/github';
import { info } from '@actions/core';

const octokit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
const { owner, repo } = github.context.repo;

export const loadPullRequests = async (ids: number[]) =>
  (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const pr = await octokit.pulls.get({
            owner,
            repo,
            pull_number: id,
          });

          if (pr.status !== 200) {
            return null;
          }

          return pr.data.body;
        } catch (e) {
          info(
            `Retrieving pull request with id "${id}" failed with the message: ${e}`
          );
          return null;
        }
      })
    )
  ).filter((pr): pr is string => pr !== null);

export const ensureLabelsExist = async (labels: string[], color: string) =>
  Promise.all(
    labels.map(async (name) => {
      try {
        await octokit.issues.createLabel({
          owner,
          repo,
          color,
          name,
        });
      } catch (e) {
        info(`Label ${name} could not be created, reason: ${e}`);
      }
    })
  );

export const addLabels = async (issueIds: number[], labels: string[]) =>
  Promise.all(
    issueIds.map((id) =>
      octokit.issues.addLabels({
        owner,
        repo,
        issue_number: id,
        labels,
      })
    )
  );
