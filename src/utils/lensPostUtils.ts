/**
 * Utility functions for working with Lens Protocol posts
 */

// No need for client imports as we're using direct GraphQL queries

/**
 * Fetch a post ID from the Lens API using the post string
 * @param postString The post string identifier from the campaign
 * @returns The numeric post ID as a BigInt
 */
export async function fetchPostIdAsUint(
  postString: string
): Promise<bigint | null> {
  try {
    // Use a direct GraphQL query instead of the client's fetchPost function
    // The Lens API endpoint - using the official API endpoint
    const apiUrl = "https://api.lens.xyz/graphql";

    // The GraphQL query to get the post ID - using the specific query provided
    const query = `
      query Post($request: PostRequest!) {
        post(request: $request) {
          ... on Post {
            id
          }
        }
      }
    `;

    // The variables for the query - using the post string directly
    console.log("Using post string:", postString);

    const variables = {
      request: {
        post: postString,
      },
    };

    console.log("Fetching post ID for post string:", postString);

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    // Parse the response
    const data = await response.json();
    console.log("API response:", data);

    // Check if we got a valid post ID
    if (data?.data?.post?.id) {
      const postId = BigInt(data.data.post.id);
      console.log("Fetched post UINT:", postId.toString());
      return postId;
    } else {
      console.error("Failed to fetch post ID:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching post ID:", error);
    return null;
  }
}

/**
 * Convert a post ID to a hex string
 * @param postId The post ID as a BigInt
 * @returns The post ID as a hex string
 */
export function postIdToHex(postId: bigint): string {
  return "0x" + postId.toString(16).padStart(64, "0");
}
