#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for ynab-api-endpoints v1.75.0
 * Generated on: 2025-07-23T16:11:42.552Z
 */

// Load environment variables from .env file
import dotenv from "dotenv";

dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	type CallToolRequest,
	CallToolRequestSchema,
	type CallToolResult,
	ListToolsRequestSchema,
	type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { ZodError, z } from "zod";

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, unknown>;

/**
 * Interface for OAuth2 flow
 */
interface OAuth2Flow {
	tokenUrl?: string;
	authorizationUrl?: string;
	scopes?: Record<string, string>;
}

/**
 * Interface for security scheme
 */
interface SecurityScheme {
	type: string;
	scheme?: string;
	name?: string;
	in?: string;
	flows?: {
		clientCredentials?: OAuth2Flow;
		password?: OAuth2Flow;
		authorizationCode?: OAuth2Flow;
		implicit?: OAuth2Flow;
	};
	[key: string]: unknown;
}

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties?: Record<string, unknown>;
		required?: string[];
		[key: string]: unknown;
	};
	method: string;
	pathTemplate: string;
	executionParameters: { name: string; in: string }[];
	requestBodyContentType?: string;
	securityRequirements: Record<string, unknown>[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "ynab-api-endpoints";
export const SERVER_VERSION = "1.75.0";
export const API_BASE_URL = "https://api.ynab.com/v1";

/**
 * MCP Server instance
 */
const server = new Server(
	{ name: SERVER_NAME, version: SERVER_VERSION },
	{ capabilities: { tools: {} } },
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([
	[
		"getUser",
		{
			name: "getUser",
			description: `Returns authenticated user information`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/user",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getBudgets",
		{
			name: "getBudgets",
			description: `Returns budgets list with summary information`,
			inputSchema: {
				type: "object",
				properties: {
					include_accounts: {
						type: "boolean",
						description: "Whether to include the list of budget accounts",
					},
				},
			},
			method: "get",
			pathTemplate: "/budgets",
			executionParameters: [{ name: "include_accounts", in: "query" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getBudgetById",
		{
			name: "getBudgetById",
			description: `Returns a single budget with all related entities.  This resource is effectively a full budget export.`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getBudgetSettingsById",
		{
			name: "getBudgetSettingsById",
			description: `Returns settings for a budget`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/settings",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getAccounts",
		{
			name: "getAccounts",
			description: `Returns all accounts`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/accounts",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"createAccount",
		{
			name: "createAccount",
			description: `Creates a new account`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget ("last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget)',
					},
					requestBody: {
						required: ["account"],
						type: "object",
						properties: {
							account: {
								required: ["balance", "name", "type"],
								type: "object",
								properties: {
									name: {
										type: "string",
										description: "The name of the account",
									},
									type: {
										type: "string",
										description: "The type of account",
										enum: [
											"checking",
											"savings",
											"cash",
											"creditCard",
											"lineOfCredit",
											"otherAsset",
											"otherLiability",
											"mortgage",
											"autoLoan",
											"studentLoan",
											"personalLoan",
											"medicalDebt",
											"otherDebt",
										],
									},
									balance: {
										type: "number",
										description:
											"The current balance of the account in milliunits format",
										format: "int64",
									},
								},
							},
						},
						description: "The account to create.",
					},
				},
				required: ["budget_id", "requestBody"],
			},
			method: "post",
			pathTemplate: "/budgets/{budget_id}/accounts",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getAccountById",
		{
			name: "getAccountById",
			description: `Returns a single account`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					account_id: {
						type: "string",
						format: "uuid",
						description: "The id of the account",
					},
				},
				required: ["budget_id", "account_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/accounts/{account_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "account_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getCategories",
		{
			name: "getCategories",
			description: `Returns all categories grouped by category group.  Amounts (budgeted, activity, balance, etc.) are specific to the current budget month (UTC).`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/categories",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getCategoryById",
		{
			name: "getCategoryById",
			description: `Returns a single category.  Amounts (budgeted, activity, balance, etc.) are specific to the current budget month (UTC).`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					category_id: {
						type: "string",
						description: "The id of the category",
					},
				},
				required: ["budget_id", "category_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/categories/{category_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "category_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updateCategory",
		{
			name: "updateCategory",
			description: `Update a category`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					category_id: {
						type: "string",
						description: "The id of the category",
					},
					requestBody: {
						required: ["category"],
						type: "object",
						properties: {
							category: {
								type: "object",
								properties: {
									name: { type: ["string", "null"] },
									note: { type: ["string", "null"] },
									category_group_id: { type: "string", format: "uuid" },
									goal_target: {
										type: ["number", "null"],
										description:
											"The goal target amount in milliunits format.  This amount can only be changed if the category already has a configured goal (goal_type != null).",
										format: "int64",
									},
								},
							},
						},
						description: "The category to update",
					},
				},
				required: ["budget_id", "category_id", "requestBody"],
			},
			method: "patch",
			pathTemplate: "/budgets/{budget_id}/categories/{category_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "category_id", in: "path" },
			],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getMonthCategoryById",
		{
			name: "getMonthCategoryById",
			description: `Returns a single category for a specific budget month.  Amounts (budgeted, activity, balance, etc.) are specific to the current budget month (UTC).`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					month: {
						type: "string",
						format: "date",
						description:
							'The budget month in ISO format (e.g. 2016-12-01) ("current" can also be used to specify the current calendar month (UTC))',
					},
					category_id: {
						type: "string",
						description: "The id of the category",
					},
				},
				required: ["budget_id", "month", "category_id"],
			},
			method: "get",
			pathTemplate:
				"/budgets/{budget_id}/months/{month}/categories/{category_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "month", in: "path" },
				{ name: "category_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updateMonthCategory",
		{
			name: "updateMonthCategory",
			description: `Update a category for a specific month.  Only \`budgeted\` amount can be updated.`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					month: {
						type: "string",
						format: "date",
						description:
							'The budget month in ISO format (e.g. 2016-12-01) ("current" can also be used to specify the current calendar month (UTC))',
					},
					category_id: {
						type: "string",
						description: "The id of the category",
					},
					requestBody: {
						required: ["category"],
						type: "object",
						properties: {
							category: {
								required: ["budgeted"],
								type: "object",
								properties: {
									budgeted: {
										type: "number",
										description: "Budgeted amount in milliunits format",
										format: "int64",
									},
								},
							},
						},
						description:
							"The category to update.  Only `budgeted` amount can be updated and any other fields specified will be ignored.",
					},
				},
				required: ["budget_id", "month", "category_id", "requestBody"],
			},
			method: "patch",
			pathTemplate:
				"/budgets/{budget_id}/months/{month}/categories/{category_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "month", in: "path" },
				{ name: "category_id", in: "path" },
			],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getPayees",
		{
			name: "getPayees",
			description: `Returns all payees`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payees",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getPayeeById",
		{
			name: "getPayeeById",
			description: `Returns a single payee`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					payee_id: { type: "string", description: "The id of the payee" },
				},
				required: ["budget_id", "payee_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payees/{payee_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "payee_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updatePayee",
		{
			name: "updatePayee",
			description: `Update a payee`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					payee_id: { type: "string", description: "The id of the payee" },
					requestBody: {
						required: ["payee"],
						type: "object",
						properties: {
							payee: {
								type: "object",
								properties: {
									name: {
										type: "string",
										maxLength: 500,
										description:
											"The name of the payee. The name must be a maximum of 500 characters.",
									},
								},
							},
						},
						description: "The payee to update",
					},
				},
				required: ["budget_id", "payee_id", "requestBody"],
			},
			method: "patch",
			pathTemplate: "/budgets/{budget_id}/payees/{payee_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "payee_id", in: "path" },
			],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getPayeeLocations",
		{
			name: "getPayeeLocations",
			description: `Returns all payee locations`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payee_locations",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getPayeeLocationById",
		{
			name: "getPayeeLocationById",
			description: `Returns a single payee location`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					payee_location_id: {
						type: "string",
						description: "id of payee location",
					},
				},
				required: ["budget_id", "payee_location_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payee_locations/{payee_location_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "payee_location_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getPayeeLocationsByPayee",
		{
			name: "getPayeeLocationsByPayee",
			description: `Returns all payee locations for a specified payee`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					payee_id: { type: "string", description: "id of payee" },
				},
				required: ["budget_id", "payee_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payees/{payee_id}/payee_locations",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "payee_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getBudgetMonths",
		{
			name: "getBudgetMonths",
			description: `Returns all budget months`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/months",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getBudgetMonth",
		{
			name: "getBudgetMonth",
			description: `Returns a single budget month`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					month: {
						type: "string",
						format: "date",
						description:
							'The budget month in ISO format (e.g. 2016-12-01) ("current" can also be used to specify the current calendar month (UTC))',
					},
				},
				required: ["budget_id", "month"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/months/{month}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "month", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactions",
		{
			name: "getTransactions",
			description: `Returns budget transactions, excluding any pending transactions`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					since_date: {
						type: "string",
						format: "date",
						description:
							"If specified, only transactions on or after this date will be included.  The date should be ISO formatted (e.g. 2016-12-30).",
					},
					type: {
						type: "string",
						enum: ["uncategorized", "unapproved"],
						description:
							'If specified, only transactions of the specified type will be included. "uncategorized" and "unapproved" are currently supported.',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "since_date", in: "query" },
				{ name: "type", in: "query" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"createTransaction",
		{
			name: "createTransaction",
			description: `Creates a single transaction or multiple transactions.  If you provide a body containing a \`transaction\` object, a single transaction will be created and if you provide a body containing a \`transactions\` array, multiple transactions will be created.  Scheduled transactions (transactions with a future date) cannot be created on this endpoint.`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					requestBody: {
						type: "object",
						properties: {
							transaction: {
								allOf: [
									{
										type: "object",
										properties: {
											account_id: { type: "string", format: "uuid" },
											date: {
												type: "string",
												description:
													"The transaction date in ISO format (e.g. 2016-12-01).  Future dates (scheduled transactions) are not permitted.  Split transaction dates cannot be changed and if a different date is supplied it will be ignored.",
												format: "date",
											},
											amount: {
												type: "integer",
												description:
													"The transaction amount in milliunits format.  Split transaction amounts cannot be changed and if a different amount is supplied it will be ignored.",
												format: "int64",
											},
											payee_id: {
												type: "string",
												nullable: true,
												description:
													"The payee for the transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
												format: "uuid",
											},
											payee_name: {
												maxLength: 200,
												type: "string",
												nullable: true,
												description:
													"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if `import_id` is also specified) or (2) a payee with the same name or (3) creation of a new payee.",
											},
											category_id: {
												type: "string",
												nullable: true,
												description:
													"The category for the transaction.  To configure a split transaction, you can specify null for `category_id` and provide a `subtransactions` array as part of the transaction object.  If an existing transaction is a split, the `category_id` cannot be changed.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
												format: "uuid",
											},
											memo: { maxLength: 500, type: "string", nullable: true },
											cleared: {
												type: "string",
												description: "The cleared status of the transaction",
												enum: ["cleared", "uncleared", "reconciled"],
											},
											approved: {
												type: "boolean",
												description:
													"Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.",
											},
											flag_color: {
												type: "string",
												description: "The transaction flag",
												enum: [
													"red",
													"orange",
													"yellow",
													"green",
													"blue",
													"purple",
													"",
													null,
												],
												nullable: true,
											},
											subtransactions: {
												type: "array",
												description:
													"An array of subtransactions to configure a transaction as a split. Updating `subtransactions` on an existing split transaction is not supported.",
												items: {
													required: ["amount"],
													type: "object",
													properties: {
														amount: {
															type: "integer",
															description:
																"The subtransaction amount in milliunits format.",
															format: "int64",
														},
														payee_id: {
															type: "string",
															nullable: true,
															description: "The payee for the subtransaction.",
															format: "uuid",
														},
														payee_name: {
															maxLength: 200,
															type: "string",
															nullable: true,
															description:
																"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if import_id is also specified on parent transaction) or (2) a payee with the same name or (3) creation of a new payee.",
														},
														category_id: {
															type: "string",
															nullable: true,
															description:
																"The category for the subtransaction.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
															format: "uuid",
														},
														memo: {
															maxLength: 500,
															type: "string",
															nullable: true,
														},
													},
												},
											},
										},
									},
									{
										type: "object",
										properties: {
											import_id: {
												maxLength: 36,
												type: "string",
												nullable: true,
												description:
													"If specified, a new transaction will be assigned this `import_id` and considered \"imported\".  We will also attempt to match this imported transaction to an existing \"user-entered\" transaction on the same account, with the same amount, and with a date +/-10 days from the imported transaction date.<br><br>Transactions imported through File Based Import or Direct Import (not through the API) are assigned an import_id in the format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'. For example, a transaction dated 2015-12-30 in the amount of -$294.23 USD would have an import_id of 'YNAB:-294230:2015-12-30:1'.  If a second transaction on the same account was imported and had the same date and same amount, its import_id would be 'YNAB:-294230:2015-12-30:2'.  Using a consistent format will prevent duplicates through Direct Import and File Based Import.<br><br>If import_id is omitted or specified as null, the transaction will be treated as a \"user-entered\" transaction. As such, it will be eligible to be matched against transactions later being imported (via DI, FBI, or API).",
											},
										},
									},
								],
							},
							transactions: {
								type: "array",
								items: {
									allOf: [
										{
											type: "object",
											properties: {
												account_id: { type: "string", format: "uuid" },
												date: {
													type: "string",
													description:
														"The transaction date in ISO format (e.g. 2016-12-01).  Future dates (scheduled transactions) are not permitted.  Split transaction dates cannot be changed and if a different date is supplied it will be ignored.",
													format: "date",
												},
												amount: {
													type: "integer",
													description:
														"The transaction amount in milliunits format.  Split transaction amounts cannot be changed and if a different amount is supplied it will be ignored.",
													format: "int64",
												},
												payee_id: {
													type: "string",
													nullable: true,
													description:
														"The payee for the transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
													format: "uuid",
												},
												payee_name: {
													maxLength: 200,
													type: "string",
													nullable: true,
													description:
														"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if `import_id` is also specified) or (2) a payee with the same name or (3) creation of a new payee.",
												},
												category_id: {
													type: "string",
													nullable: true,
													description:
														"The category for the transaction.  To configure a split transaction, you can specify null for `category_id` and provide a `subtransactions` array as part of the transaction object.  If an existing transaction is a split, the `category_id` cannot be changed.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
													format: "uuid",
												},
												memo: {
													maxLength: 500,
													type: "string",
													nullable: true,
												},
												cleared: {
													type: "string",
													description: "The cleared status of the transaction",
													enum: ["cleared", "uncleared", "reconciled"],
												},
												approved: {
													type: "boolean",
													description:
														"Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.",
												},
												flag_color: {
													type: "string",
													description: "The transaction flag",
													enum: [
														"red",
														"orange",
														"yellow",
														"green",
														"blue",
														"purple",
														"",
														null,
													],
													nullable: true,
												},
												subtransactions: {
													type: "array",
													description:
														"An array of subtransactions to configure a transaction as a split. Updating `subtransactions` on an existing split transaction is not supported.",
													items: {
														required: ["amount"],
														type: "object",
														properties: {
															amount: {
																type: "integer",
																description:
																	"The subtransaction amount in milliunits format.",
																format: "int64",
															},
															payee_id: {
																type: "string",
																nullable: true,
																description:
																	"The payee for the subtransaction.",
																format: "uuid",
															},
															payee_name: {
																maxLength: 200,
																type: "string",
																nullable: true,
																description:
																	"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if import_id is also specified on parent transaction) or (2) a payee with the same name or (3) creation of a new payee.",
															},
															category_id: {
																type: "string",
																nullable: true,
																description:
																	"The category for the subtransaction.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
																format: "uuid",
															},
															memo: {
																maxLength: 500,
																type: "string",
																nullable: true,
															},
														},
													},
												},
											},
										},
										{
											type: "object",
											properties: {
												import_id: {
													maxLength: 36,
													type: "string",
													nullable: true,
													description:
														"If specified, a new transaction will be assigned this `import_id` and considered \"imported\".  We will also attempt to match this imported transaction to an existing \"user-entered\" transaction on the same account, with the same amount, and with a date +/-10 days from the imported transaction date.<br><br>Transactions imported through File Based Import or Direct Import (not through the API) are assigned an import_id in the format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'. For example, a transaction dated 2015-12-30 in the amount of -$294.23 USD would have an import_id of 'YNAB:-294230:2015-12-30:1'.  If a second transaction on the same account was imported and had the same date and same amount, its import_id would be 'YNAB:-294230:2015-12-30:2'.  Using a consistent format will prevent duplicates through Direct Import and File Based Import.<br><br>If import_id is omitted or specified as null, the transaction will be treated as a \"user-entered\" transaction. As such, it will be eligible to be matched against transactions later being imported (via DI, FBI, or API).",
												},
											},
										},
									],
								},
							},
						},
						description:
							"The transaction or transactions to create.  To create a single transaction you can specify a value for the `transaction` object and to create multiple transactions you can specify an array of `transactions`.  It is expected that you will only provide a value for one of these objects.",
					},
				},
				required: ["budget_id", "requestBody"],
			},
			method: "post",
			pathTemplate: "/budgets/{budget_id}/transactions",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updateTransactions",
		{
			name: "updateTransactions",
			description: `Updates multiple transactions, by \`id\` or \`import_id\`.`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					requestBody: {
						required: ["transactions"],
						type: "object",
						properties: {
							transactions: {
								type: "array",
								items: {
									allOf: [
										{
											type: "object",
											properties: {
												id: {
													type: "string",
													nullable: true,
													description:
														"If specified, this id will be used to lookup a transaction by its `id` for the purpose of updating the transaction itself. If not specified, an `import_id` should be supplied.",
												},
												import_id: {
													maxLength: 36,
													type: "string",
													nullable: true,
													description:
														"If specified, this id will be used to lookup a transaction by its `import_id` for the purpose of updating the transaction itself. If not specified, an `id` should be supplied.  You may not provide both an `id` and an `import_id` and updating an `import_id` on an existing transaction is not allowed.",
												},
											},
										},
										{
											type: "object",
											properties: {
												account_id: { type: "string", format: "uuid" },
												date: {
													type: "string",
													description:
														"The transaction date in ISO format (e.g. 2016-12-01).  Future dates (scheduled transactions) are not permitted.  Split transaction dates cannot be changed and if a different date is supplied it will be ignored.",
													format: "date",
												},
												amount: {
													type: "integer",
													description:
														"The transaction amount in milliunits format.  Split transaction amounts cannot be changed and if a different amount is supplied it will be ignored.",
													format: "int64",
												},
												payee_id: {
													type: "string",
													nullable: true,
													description:
														"The payee for the transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
													format: "uuid",
												},
												payee_name: {
													maxLength: 200,
													type: "string",
													nullable: true,
													description:
														"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if `import_id` is also specified) or (2) a payee with the same name or (3) creation of a new payee.",
												},
												category_id: {
													type: "string",
													nullable: true,
													description:
														"The category for the transaction.  To configure a split transaction, you can specify null for `category_id` and provide a `subtransactions` array as part of the transaction object.  If an existing transaction is a split, the `category_id` cannot be changed.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
													format: "uuid",
												},
												memo: {
													maxLength: 500,
													type: "string",
													nullable: true,
												},
												cleared: {
													type: "string",
													description: "The cleared status of the transaction",
													enum: ["cleared", "uncleared", "reconciled"],
												},
												approved: {
													type: "boolean",
													description:
														"Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.",
												},
												flag_color: {
													type: "string",
													description: "The transaction flag",
													enum: [
														"red",
														"orange",
														"yellow",
														"green",
														"blue",
														"purple",
														"",
														null,
													],
													nullable: true,
												},
												subtransactions: {
													type: "array",
													description:
														"An array of subtransactions to configure a transaction as a split. Updating `subtransactions` on an existing split transaction is not supported.",
													items: {
														required: ["amount"],
														type: "object",
														properties: {
															amount: {
																type: "integer",
																description:
																	"The subtransaction amount in milliunits format.",
																format: "int64",
															},
															payee_id: {
																type: "string",
																nullable: true,
																description:
																	"The payee for the subtransaction.",
																format: "uuid",
															},
															payee_name: {
																maxLength: 200,
																type: "string",
																nullable: true,
																description:
																	"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if import_id is also specified on parent transaction) or (2) a payee with the same name or (3) creation of a new payee.",
															},
															category_id: {
																type: "string",
																nullable: true,
																description:
																	"The category for the subtransaction.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
																format: "uuid",
															},
															memo: {
																maxLength: 500,
																type: "string",
																nullable: true,
															},
														},
													},
												},
											},
										},
									],
								},
							},
						},
						description:
							"The transactions to update. Each transaction must have either an `id` or `import_id` specified. If `id` is specified as null an `import_id` value can be provided which will allow transaction(s) to be updated by its `import_id`. If an `id` is specified, it will always be used for lookup.  You should not specify both `id` and `import_id`.  Updating an `import_id` on an existing transaction is not allowed; if an `import_id` is specified, it will only be used to lookup the transaction.",
					},
				},
				required: ["budget_id", "requestBody"],
			},
			method: "patch",
			pathTemplate: "/budgets/{budget_id}/transactions",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"importTransactions",
		{
			name: "importTransactions",
			description: `Imports available transactions on all linked accounts for the given budget.  Linked accounts allow transactions to be imported directly from a specified financial institution and this endpoint initiates that import.  Sending a request to this endpoint is the equivalent of clicking "Import" on each account in the web application or tapping the "New Transactions" banner in the mobile applications.  The response for this endpoint contains the transaction ids that have been imported.`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
				},
				required: ["budget_id"],
			},
			method: "post",
			pathTemplate: "/budgets/{budget_id}/transactions/import",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactionById",
		{
			name: "getTransactionById",
			description: `Returns a single transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					transaction_id: {
						type: "string",
						description: "The id of the transaction",
					},
				},
				required: ["budget_id", "transaction_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/transactions/{transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "transaction_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updateTransaction",
		{
			name: "updateTransaction",
			description: `Updates a single transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					transaction_id: {
						type: "string",
						description: "The id of the transaction",
					},
					requestBody: {
						required: ["transaction"],
						type: "object",
						properties: {
							transaction: {
								allOf: [
									{ type: "object" },
									{
										type: "object",
										properties: {
											account_id: { type: "string", format: "uuid" },
											date: {
												type: "string",
												description:
													"The transaction date in ISO format (e.g. 2016-12-01).  Future dates (scheduled transactions) are not permitted.  Split transaction dates cannot be changed and if a different date is supplied it will be ignored.",
												format: "date",
											},
											amount: {
												type: "integer",
												description:
													"The transaction amount in milliunits format.  Split transaction amounts cannot be changed and if a different amount is supplied it will be ignored.",
												format: "int64",
											},
											payee_id: {
												type: "string",
												nullable: true,
												description:
													"The payee for the transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
												format: "uuid",
											},
											payee_name: {
												maxLength: 200,
												type: "string",
												nullable: true,
												description:
													"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if `import_id` is also specified) or (2) a payee with the same name or (3) creation of a new payee.",
											},
											category_id: {
												type: "string",
												nullable: true,
												description:
													"The category for the transaction.  To configure a split transaction, you can specify null for `category_id` and provide a `subtransactions` array as part of the transaction object.  If an existing transaction is a split, the `category_id` cannot be changed.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
												format: "uuid",
											},
											memo: { maxLength: 500, type: "string", nullable: true },
											cleared: {
												type: "string",
												description: "The cleared status of the transaction",
												enum: ["cleared", "uncleared", "reconciled"],
											},
											approved: {
												type: "boolean",
												description:
													"Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.",
											},
											flag_color: {
												type: "string",
												description: "The transaction flag",
												enum: [
													"red",
													"orange",
													"yellow",
													"green",
													"blue",
													"purple",
													"",
													null,
												],
												nullable: true,
											},
											subtransactions: {
												type: "array",
												description:
													"An array of subtransactions to configure a transaction as a split. Updating `subtransactions` on an existing split transaction is not supported.",
												items: {
													required: ["amount"],
													type: "object",
													properties: {
														amount: {
															type: "integer",
															description:
																"The subtransaction amount in milliunits format.",
															format: "int64",
														},
														payee_id: {
															type: "string",
															nullable: true,
															description: "The payee for the subtransaction.",
															format: "uuid",
														},
														payee_name: {
															maxLength: 200,
															type: "string",
															nullable: true,
															description:
																"The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if import_id is also specified on parent transaction) or (2) a payee with the same name or (3) creation of a new payee.",
														},
														category_id: {
															type: "string",
															nullable: true,
															description:
																"The category for the subtransaction.  Credit Card Payment categories are not permitted and will be ignored if supplied.",
															format: "uuid",
														},
														memo: {
															maxLength: 500,
															type: "string",
															nullable: true,
														},
													},
												},
											},
										},
									},
								],
							},
						},
						description: "The transaction to update",
					},
				},
				required: ["budget_id", "transaction_id", "requestBody"],
			},
			method: "put",
			pathTemplate: "/budgets/{budget_id}/transactions/{transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "transaction_id", in: "path" },
			],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"deleteTransaction",
		{
			name: "deleteTransaction",
			description: `Deletes a transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					transaction_id: {
						type: "string",
						description: "The id of the transaction",
					},
				},
				required: ["budget_id", "transaction_id"],
			},
			method: "delete",
			pathTemplate: "/budgets/{budget_id}/transactions/{transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "transaction_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactionsByAccount",
		{
			name: "getTransactionsByAccount",
			description: `Returns all transactions for a specified account, excluding any pending transactions`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					account_id: { type: "string", description: "The id of the account" },
					since_date: {
						type: "string",
						format: "date",
						description:
							"If specified, only transactions on or after this date will be included.  The date should be ISO formatted (e.g. 2016-12-30).",
					},
					type: {
						type: "string",
						enum: ["uncategorized", "unapproved"],
						description:
							'If specified, only transactions of the specified type will be included. "uncategorized" and "unapproved" are currently supported.',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id", "account_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/accounts/{account_id}/transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "account_id", in: "path" },
				{ name: "since_date", in: "query" },
				{ name: "type", in: "query" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactionsByCategory",
		{
			name: "getTransactionsByCategory",
			description: `Returns all transactions for a specified category`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					category_id: {
						type: "string",
						description: "The id of the category",
					},
					since_date: {
						type: "string",
						format: "date",
						description:
							"If specified, only transactions on or after this date will be included.  The date should be ISO formatted (e.g. 2016-12-30).",
					},
					type: {
						type: "string",
						enum: ["uncategorized", "unapproved"],
						description:
							'If specified, only transactions of the specified type will be included. "uncategorized" and "unapproved" are currently supported.',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id", "category_id"],
			},
			method: "get",
			pathTemplate:
				"/budgets/{budget_id}/categories/{category_id}/transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "category_id", in: "path" },
				{ name: "since_date", in: "query" },
				{ name: "type", in: "query" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactionsByPayee",
		{
			name: "getTransactionsByPayee",
			description: `Returns all transactions for a specified payee`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					payee_id: { type: "string", description: "The id of the payee" },
					since_date: {
						type: "string",
						format: "date",
						description:
							"If specified, only transactions on or after this date will be included.  The date should be ISO formatted (e.g. 2016-12-30).",
					},
					type: {
						type: "string",
						enum: ["uncategorized", "unapproved"],
						description:
							'If specified, only transactions of the specified type will be included. "uncategorized" and "unapproved" are currently supported.',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id", "payee_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/payees/{payee_id}/transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "payee_id", in: "path" },
				{ name: "since_date", in: "query" },
				{ name: "type", in: "query" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getTransactionsByMonth",
		{
			name: "getTransactionsByMonth",
			description: `Returns all transactions for a specified month`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					month: {
						type: "string",
						description:
							'The budget month in ISO format (e.g. 2016-12-01) ("current" can also be used to specify the current calendar month (UTC))',
					},
					since_date: {
						type: "string",
						format: "date",
						description:
							"If specified, only transactions on or after this date will be included.  The date should be ISO formatted (e.g. 2016-12-30).",
					},
					type: {
						type: "string",
						enum: ["uncategorized", "unapproved"],
						description:
							'If specified, only transactions of the specified type will be included. "uncategorized" and "unapproved" are currently supported.',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id", "month"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/months/{month}/transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "month", in: "path" },
				{ name: "since_date", in: "query" },
				{ name: "type", in: "query" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getScheduledTransactions",
		{
			name: "getScheduledTransactions",
			description: `Returns all scheduled transactions`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					last_knowledge_of_server: {
						type: "number",
						format: "int64",
						description:
							"The starting server knowledge.  If provided, only entities that have changed since `last_knowledge_of_server` will be included.",
					},
				},
				required: ["budget_id"],
			},
			method: "get",
			pathTemplate: "/budgets/{budget_id}/scheduled_transactions",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "last_knowledge_of_server", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"createScheduledTransaction",
		{
			name: "createScheduledTransaction",
			description: `Creates a single scheduled transaction (a transaction with a future date).`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					requestBody: {
						required: ["scheduled_transaction"],
						type: "object",
						properties: {
							scheduled_transaction: {
								required: ["account_id", "date"],
								type: "object",
								properties: {
									account_id: { type: "string", format: "uuid" },
									date: {
										type: "string",
										description:
											"The scheduled transaction date in ISO format (e.g. 2016-12-01).  This should be a future date no more than 5 years into the future.",
										format: "date",
									},
									amount: {
										type: "number",
										description:
											"The scheduled transaction amount in milliunits format.",
										format: "int64",
									},
									payee_id: {
										type: ["string", "null"],
										description:
											"The payee for the scheduled transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
										format: "uuid",
									},
									payee_name: {
										maxLength: 200,
										type: ["string", "null"],
										description:
											"The payee name for the the scheduled transaction.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a payee with the same name or (2) creation of a new payee.",
									},
									category_id: {
										type: ["string", "null"],
										description:
											"The category for the scheduled transaction. Credit Card Payment categories are not permitted. Creating a split scheduled transaction is not currently supported.",
										format: "uuid",
									},
									memo: { maxLength: 500, type: ["string", "null"] },
									flag_color: {
										type: ["string", "null"],
										description: "The transaction flag",
										enum: [
											"red",
											"orange",
											"yellow",
											"green",
											"blue",
											"purple",
											"",
											null,
										],
									},
									frequency: {
										type: "string",
										description: "The scheduled transaction frequency",
										enum: [
											"never",
											"daily",
											"weekly",
											"everyOtherWeek",
											"twiceAMonth",
											"every4Weeks",
											"monthly",
											"everyOtherMonth",
											"every3Months",
											"every4Months",
											"twiceAYear",
											"yearly",
											"everyOtherYear",
										],
									},
								},
							},
						},
						description: "The scheduled transaction to create",
					},
				},
				required: ["budget_id", "requestBody"],
			},
			method: "post",
			pathTemplate: "/budgets/{budget_id}/scheduled_transactions",
			executionParameters: [{ name: "budget_id", in: "path" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"getScheduledTransactionById",
		{
			name: "getScheduledTransactionById",
			description: `Returns a single scheduled transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					scheduled_transaction_id: {
						type: "string",
						description: "The id of the scheduled transaction",
					},
				},
				required: ["budget_id", "scheduled_transaction_id"],
			},
			method: "get",
			pathTemplate:
				"/budgets/{budget_id}/scheduled_transactions/{scheduled_transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "scheduled_transaction_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"updateScheduledTransaction",
		{
			name: "updateScheduledTransaction",
			description: `Updates a single scheduled transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					scheduled_transaction_id: {
						type: "string",
						description: "The id of the scheduled transaction",
					},
					requestBody: {
						required: ["scheduled_transaction"],
						type: "object",
						properties: {
							scheduled_transaction: {
								required: ["account_id", "date"],
								type: "object",
								properties: {
									account_id: { type: "string", format: "uuid" },
									date: {
										type: "string",
										description:
											"The scheduled transaction date in ISO format (e.g. 2016-12-01).  This should be a future date no more than 5 years into the future.",
										format: "date",
									},
									amount: {
										type: "number",
										description:
											"The scheduled transaction amount in milliunits format.",
										format: "int64",
									},
									payee_id: {
										type: ["string", "null"],
										description:
											"The payee for the scheduled transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `transfer_payee_id` on the account resource.",
										format: "uuid",
									},
									payee_name: {
										maxLength: 200,
										type: ["string", "null"],
										description:
											"The payee name for the the scheduled transaction.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a payee with the same name or (2) creation of a new payee.",
									},
									category_id: {
										type: ["string", "null"],
										description:
											"The category for the scheduled transaction. Credit Card Payment categories are not permitted. Creating a split scheduled transaction is not currently supported.",
										format: "uuid",
									},
									memo: { maxLength: 500, type: ["string", "null"] },
									flag_color: {
										type: ["string", "null"],
										description: "The transaction flag",
										enum: [
											"red",
											"orange",
											"yellow",
											"green",
											"blue",
											"purple",
											"",
											null,
										],
									},
									frequency: {
										type: "string",
										description: "The scheduled transaction frequency",
										enum: [
											"never",
											"daily",
											"weekly",
											"everyOtherWeek",
											"twiceAMonth",
											"every4Weeks",
											"monthly",
											"everyOtherMonth",
											"every3Months",
											"every4Months",
											"twiceAYear",
											"yearly",
											"everyOtherYear",
										],
									},
								},
							},
						},
						description: "The scheduled transaction to update",
					},
				},
				required: ["budget_id", "scheduled_transaction_id", "requestBody"],
			},
			method: "put",
			pathTemplate:
				"/budgets/{budget_id}/scheduled_transactions/{scheduled_transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "scheduled_transaction_id", in: "path" },
			],
			requestBodyContentType: "application/json",
			securityRequirements: [{ bearer: [] }],
		},
	],
	[
		"deleteScheduledTransaction",
		{
			name: "deleteScheduledTransaction",
			description: `Deletes a scheduled transaction`,
			inputSchema: {
				type: "object",
				properties: {
					budget_id: {
						type: "string",
						description:
							'The id of the budget. "last-used" can be used to specify the last used budget and "default" can be used if default budget selection is enabled (see: https://api.ynab.com/#oauth-default-budget).',
					},
					scheduled_transaction_id: {
						type: "string",
						description: "The id of the scheduled transaction",
					},
				},
				required: ["budget_id", "scheduled_transaction_id"],
			},
			method: "delete",
			pathTemplate:
				"/budgets/{budget_id}/scheduled_transactions/{scheduled_transaction_id}",
			executionParameters: [
				{ name: "budget_id", in: "path" },
				{ name: "scheduled_transaction_id", in: "path" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ bearer: [] }],
		},
	],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes = {
	bearer: {
		type: "http",
		scheme: "bearer",
	},
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
	const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(
		(def) => ({
			name: def.name,
			description: def.description,
			inputSchema: def.inputSchema,
		}),
	);
	return { tools: toolsForClient };
});

server.setRequestHandler(
	CallToolRequestSchema,
	async (request: CallToolRequest): Promise<CallToolResult> => {
		const { name: toolName, arguments: toolArgs } = request.params;
		const toolDefinition = toolDefinitionMap.get(toolName);
		if (!toolDefinition) {
			console.error(`Error: Unknown tool requested: ${toolName}`);
			return {
				content: [
					{ type: "text", text: `Error: Unknown tool requested: ${toolName}` },
				],
			};
		}
		return await executeApiTool(
			toolName,
			toolDefinition,
			toolArgs ?? {},
			securitySchemes,
		);
	},
);

/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
	token: string;
	expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
	var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 *
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(
	schemeName: string,
	scheme: SecurityScheme,
): Promise<string | null | undefined> {
	try {
		// Check if we have the necessary credentials
		const clientId =
			process.env[
				`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
			];
		const clientSecret =
			process.env[
				`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
			];
		const scopes =
			process.env[
				`OAUTH_SCOPES_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
			];

		if (!clientId || !clientSecret) {
			console.error(
				`Missing client credentials for OAuth2 scheme '${schemeName}'`,
			);
			return null;
		}

		// Initialize token cache if needed
		if (typeof global.__oauthTokenCache === "undefined") {
			global.__oauthTokenCache = {};
		}

		// Check if we have a cached token
		const cacheKey = `${schemeName}_${clientId}`;
		const cachedToken = global.__oauthTokenCache[cacheKey];
		const now = Date.now();

		if (cachedToken && cachedToken.expiresAt > now) {
			console.error(
				`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`,
			);
			return cachedToken.token;
		}

		// Determine token URL based on flow type
		let tokenUrl = "";
		if (scheme.flows?.clientCredentials?.tokenUrl) {
			tokenUrl = scheme.flows.clientCredentials.tokenUrl;
			console.error(`Using client credentials flow for '${schemeName}'`);
		} else if (scheme.flows?.password?.tokenUrl) {
			tokenUrl = scheme.flows.password.tokenUrl;
			console.error(`Using password flow for '${schemeName}'`);
		} else {
			console.error(`No supported OAuth2 flow found for '${schemeName}'`);
			return null;
		}

		// Prepare the token request
		const formData = new URLSearchParams();
		formData.append("grant_type", "client_credentials");

		// Add scopes if specified
		if (scopes) {
			formData.append("scope", scopes);
		}

		console.error(`Requesting OAuth2 token from ${tokenUrl}`);

		// Make the token request
		const response = await axios({
			method: "POST",
			url: tokenUrl,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			},
			data: formData.toString(),
		});

		// Process the response
		if (response.data?.access_token) {
			const token = response.data.access_token;
			const expiresIn = response.data.expires_in || 3600; // Default to 1 hour

			// Cache the token
			global.__oauthTokenCache[cacheKey] = {
				token,
				expiresAt: now + expiresIn * 1000 - 60000, // Expire 1 minute early
			};

			console.error(
				`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`,
			);
			return token;
		} else {
			console.error(
				`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`,
			);
			return null;
		}
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`Error acquiring OAuth2 token for '${schemeName}':`,
			errorMessage,
		);
		return null;
	}
}

/**
 * Executes an API tool with the provided arguments
 *
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
	toolName: string,
	definition: McpToolDefinition,
	toolArgs: JsonObject,
	allSecuritySchemes: Record<string, SecurityScheme>,
): Promise<CallToolResult> {
	try {
		// Validate arguments against the input schema
		let validatedArgs: JsonObject;
		try {
			const zodSchema = getZodSchemaFromJsonSchema(
				definition.inputSchema,
				toolName,
			);
			const argsToParse =
				typeof toolArgs === "object" && toolArgs !== null ? toolArgs : {};
			validatedArgs = zodSchema.parse(argsToParse);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map((e) => `${e.path.join(".")} (${e.code}): ${e.message}`).join(", ")}`;
				return { content: [{ type: "text", text: validationErrorMessage }] };
			} else {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				return {
					content: [
						{
							type: "text",
							text: `Internal error during validation setup: ${errorMessage}`,
						},
					],
				};
			}
		}

		// Prepare URL, query parameters, headers, and request body
		let urlPath = definition.pathTemplate;
		const queryParams: Record<string, unknown> = {};
		const headers: Record<string, string> = { Accept: "application/json" };
		let requestBodyData: unknown;

		// Apply parameters to the URL path, query, or headers
		definition.executionParameters.forEach((param) => {
			const value = validatedArgs[param.name];
			if (typeof value !== "undefined" && value !== null) {
				if (param.in === "path") {
					urlPath = urlPath.replace(
						`{${param.name}}`,
						encodeURIComponent(String(value)),
					);
				} else if (param.in === "query") {
					queryParams[param.name] = value;
				} else if (param.in === "header") {
					headers[param.name.toLowerCase()] = String(value);
				}
			}
		});

		// Ensure all path parameters are resolved
		if (urlPath.includes("{")) {
			throw new Error(`Failed to resolve path parameters: ${urlPath}`);
		}

		// Construct the full URL
		const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

		// Handle request body if needed
		if (
			definition.requestBodyContentType &&
			typeof validatedArgs.requestBody !== "undefined"
		) {
			requestBodyData = validatedArgs.requestBody;
			headers["content-type"] = definition.requestBodyContentType;
		}

		// Apply security requirements if available
		// Security requirements use OR between array items and AND within each object
		const appliedSecurity = definition.securityRequirements?.find((req) => {
			// Try each security requirement (combined with OR)
			return Object.entries(req).every(([schemeName, _scopesArray]) => {
				const scheme = allSecuritySchemes[schemeName];
				if (!scheme) return false;

				// API Key security (header, query, cookie)
				if (scheme.type === "apiKey") {
					console.log(
						`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`,
					);
					return !!process.env[
						`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
					];
				}

				// HTTP security (basic, bearer)
				if (scheme.type === "http") {
					if (scheme.scheme?.toLowerCase() === "bearer") {
						return !!process.env[
							`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						];
					} else if (scheme.scheme?.toLowerCase() === "basic") {
						return (
							!!process.env[
								`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							] &&
							!!process.env[
								`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							]
						);
					}
				}

				// OAuth2 security
				if (scheme.type === "oauth2") {
					// Check for pre-existing token
					if (
						process.env[
							`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						]
					) {
						return true;
					}

					// Check for client credentials for auto-acquisition
					if (
						process.env[
							`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						] &&
						process.env[
							`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						]
					) {
						// Verify we have a supported flow
						if (scheme.flows?.clientCredentials || scheme.flows?.password) {
							return true;
						}
					}

					return false;
				}

				// OpenID Connect
				if (scheme.type === "openIdConnect") {
					return !!process.env[
						`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
					];
				}

				return false;
			});
		});

		// If we found matching security scheme(s), apply them
		if (appliedSecurity) {
			// Apply each security scheme from this requirement (combined with AND)
			for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
				const scheme = allSecuritySchemes[schemeName];

				// API Key security
				if (scheme?.type === "apiKey") {
					const apiKey =
						process.env[
							`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						];
					if (apiKey) {
						if (scheme.in === "header" && scheme.name) {
							headers[scheme.name.toLowerCase()] = apiKey;
							console.error(
								`Applied API key '${schemeName}' in header '${scheme.name}'`,
							);
						} else if (scheme.in === "query" && scheme.name) {
							queryParams[scheme.name] = apiKey;
							console.error(
								`Applied API key '${schemeName}' in query parameter '${scheme.name}'`,
							);
						} else if (scheme.in === "cookie" && scheme.name) {
							// Add the cookie, preserving other cookies if they exist
							headers.cookie = `${scheme.name}=${apiKey}${headers.cookie ? `; ${headers.cookie}` : ""}`;
							console.error(
								`Applied API key '${schemeName}' in cookie '${scheme.name}'`,
							);
						}
					}
				}
				// HTTP security (Bearer or Basic)
				else if (scheme?.type === "http") {
					if (scheme.scheme?.toLowerCase() === "bearer") {
						const token =
							process.env[
								`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							];
						if (token) {
							headers.authorization = `Bearer ${token}`;
							console.error(`Applied Bearer token for '${schemeName}'`);
						}
					} else if (scheme.scheme?.toLowerCase() === "basic") {
						const username =
							process.env[
								`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							];
						const password =
							process.env[
								`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							];
						if (username && password) {
							headers.authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
							console.error(`Applied Basic authentication for '${schemeName}'`);
						}
					}
				}
				// OAuth2 security
				else if (scheme?.type === "oauth2") {
					// First try to use a pre-provided token
					let token =
						process.env[
							`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						];

					// If no token but we have client credentials, try to acquire a token
					if (
						!token &&
						(scheme.flows?.clientCredentials || scheme.flows?.password)
					) {
						console.error(
							`Attempting to acquire OAuth token for '${schemeName}'`,
						);
						token = (await acquireOAuth2Token(schemeName, scheme)) ?? "";
					}

					// Apply token if available
					if (token) {
						headers.authorization = `Bearer ${token}`;
						console.error(`Applied OAuth2 token for '${schemeName}'`);

						// List the scopes that were requested, if any
						const scopes = scopesArray as string[];
						if (scopes && scopes.length > 0) {
							console.error(`Requested scopes: ${scopes.join(", ")}`);
						}
					}
				}
				// OpenID Connect
				else if (scheme?.type === "openIdConnect") {
					const token =
						process.env[
							`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						];
					if (token) {
						headers.authorization = `Bearer ${token}`;
						console.error(`Applied OpenID Connect token for '${schemeName}'`);

						// List the scopes that were requested, if any
						const scopes = scopesArray as string[];
						if (scopes && scopes.length > 0) {
							console.error(`Requested scopes: ${scopes.join(", ")}`);
						}
					}
				}
			}
		}
		// Log warning if security is required but not available
		else if (definition.securityRequirements?.length > 0) {
			// First generate a more readable representation of the security requirements
			const securityRequirementsString = definition.securityRequirements
				.map((req) => {
					const parts = Object.entries(req)
						.map(([name, scopesArray]) => {
							const scopes = scopesArray as string[];
							if (scopes.length === 0) return name;
							return `${name} (scopes: ${scopes.join(", ")})`;
						})
						.join(" AND ");
					return `[${parts}]`;
				})
				.join(" OR ");

			console.warn(
				`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`,
			);
		}

		// Prepare the axios request configuration
		const config: AxiosRequestConfig = {
			method: definition.method.toUpperCase(),
			url: requestUrl,
			params: queryParams,
			headers: headers,
			...(requestBodyData !== undefined && { data: requestBodyData }),
		};

		// Log request info to stderr (doesn't affect MCP output)
		console.error(
			`Executing tool "${toolName}": ${config.method} ${config.url}`,
		);

		// Execute the request
		const response = await axios(config);

		// Process and format the response
		let responseText = "";
		const contentType = response.headers["content-type"]?.toLowerCase() || "";

		// Handle JSON responses
		if (
			contentType.includes("application/json") &&
			typeof response.data === "object" &&
			response.data !== null
		) {
			try {
				responseText = JSON.stringify(response.data, null, 2);
			} catch (_e) {
				responseText = "[Stringify Error]";
			}
		}
		// Handle string responses
		else if (typeof response.data === "string") {
			responseText = response.data;
		}
		// Handle other response types
		else if (response.data !== undefined && response.data !== null) {
			responseText = String(response.data);
		}
		// Handle empty responses
		else {
			responseText = `(Status: ${response.status} - No body content)`;
		}

		// Return formatted response
		return {
			content: [
				{
					type: "text",
					text: `API Response (Status: ${response.status}):\n${responseText}`,
				},
			],
		};
	} catch (error: unknown) {
		// Handle errors during execution
		let errorMessage: string;

		// Format Axios errors specially
		if (axios.isAxiosError(error)) {
			errorMessage = formatApiError(error);
		}
		// Handle standard errors
		else if (error instanceof Error) {
			errorMessage = error.message;
		}
		// Handle unexpected error types
		else {
			errorMessage = `Unexpected error: ${String(error)}`;
		}

		// Log error to stderr
		console.error(
			`Error during execution of tool '${toolName}':`,
			errorMessage,
		);

		// Return error message to client
		return { content: [{ type: "text", text: errorMessage }] };
	}
}

/**
 * Main function to start the server
 */
async function main() {
	// Set up stdio transport
	try {
		const transport = new StdioServerTransport();
		await server.connect(transport);
		console.error(
			`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio${API_BASE_URL ? `, proxying API at ${API_BASE_URL}` : ""}`,
		);
	} catch (error) {
		console.error("Error during server startup:", error);
		process.exit(1);
	}
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
	console.error("Shutting down MCP server...");
	process.exit(0);
}

// Register signal handlers
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start the server
main().catch((error) => {
	console.error("Fatal error in main execution:", error);
	process.exit(1);
});

/**
 * Formats API errors for better readability
 *
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
	let message = "API request failed.";
	if (error.response) {
		message = `API Error: Status ${error.response.status} (${error.response.statusText || "Status text not available"}). `;
		const responseData = error.response.data;
		const MAX_LEN = 200;
		if (typeof responseData === "string") {
			message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? "..." : ""}`;
		} else if (responseData) {
			try {
				const jsonString = JSON.stringify(responseData);
				message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? "..." : ""}`;
			} catch {
				message += "Response: [Could not serialize data]";
			}
		} else {
			message += "No response body received.";
		}
	} else if (error.request) {
		message = "API Network Error: No response received from server.";
		if (error.code) message += ` (Code: ${error.code})`;
	} else {
		message += `API Request Setup Error: ${error.message}`;
	}
	return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 *
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(
	jsonSchema: Record<string, unknown>,
	toolName: string,
): z.ZodTypeAny {
	if (typeof jsonSchema !== "object" || jsonSchema === null) {
		return z.object({}).passthrough();
	}
	try {
		const zodSchemaString = jsonSchemaToZod(jsonSchema);
		// Use Function constructor instead of eval for better security
		const zodSchema = new Function("z", `return ${zodSchemaString}`)(z);
		if (typeof zodSchema?.parse !== "function") {
			throw new Error("Generated code did not produce a valid Zod schema.");
		}
		return zodSchema as z.ZodTypeAny;
	} catch (err: unknown) {
		console.error(
			`Failed to generate/evaluate Zod schema for '${toolName}':`,
			err,
		);
		return z.object({}).passthrough();
	}
}
