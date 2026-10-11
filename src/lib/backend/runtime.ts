import "server-only";
import { publicConfig, submissionConfig } from "./config";
import { authorizeOwner } from "./auth";
import { createHandlers } from "./handlers";
import { checkOrigin, protectSubmission } from "./protection";
import {
  databaseClient,
  ownerRepository,
  publicRepository,
  submissionRepository,
} from "./repository";

// Lazy configuration: rendering/building the portfolio requires no backend secrets.
export const handlers = createHandlers({
  submissions() {
    const config = submissionConfig();
    return submissionRepository(databaseClient(config.url, config.serviceKey));
  },
  publicComments() {
    const config = publicConfig();
    return publicRepository(databaseClient(config.url, config.key));
  },
  async owner(token) {
    const config = publicConfig();
    const client = databaseClient(config.url, config.key, token);
    await authorizeOwner(token, {
      getUser: (token) => client.auth.getUser(token),
      isOwner: async () => client.rpc("is_portfolio_owner"),
    });
    return ownerRepository(client);
  },
  origin: checkOrigin,
  async protect(request, token, action) {
    const config = submissionConfig();
    const repo = submissionRepository(
      databaseClient(config.url, config.serviceKey),
    );
    await protectSubmission(request, token, action, config, (hash) =>
      repo.consumeLimit(hash),
    );
  },
});
