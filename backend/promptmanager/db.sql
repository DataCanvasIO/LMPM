create table class (
	id text(50) not null primary key,
	name text(255) not null,
	source text(50) not null,
	role_prompt text,
	type text(50) not null,
	create_time integer,
	update_time integer,
	order_id integer,
	user_id text
);

create table prompt  (
	id text(50) not null primary key,
	name text(255) not null,
	note text,
	prompt text,
	source text(50) not null,
	role_id text(50),
	scene_id text(50),
	labels_ids text,
	variables text,
	collecte_status text(50),
	create_time integer,
	update_time integer,
	user_id text,
	score real
);

create table model  (
	id text(50) not null primary key,
	name text(255) not null,
	description text,
	config text not null,
	params text not null,
	source text(50) not null,
	enable_stream integer,
	is_default integer,
	create_time integer,
	update_time integer,
	user_id text
);

create table module  (
	id text(50) not null primary key,
	name text(255) not null,
	description text,
	source text(50) not null,
	type text(50) not null,
	"group" text(50) not null,
	params text not null,
	inputs text not null,
	outputs text not null,
	create_time integer,
	update_time integer,
	user_id text
);

insert into module (id, name, description, "source", "type","group", params, inputs, outputs, create_time, update_time, user_id)
values
('00000000-0000-0000-0000-000000000001', 'input', 'The input node of flow is the beginning of the flow. User input will be sent to the flow from it.', 'system', 'input','input', '[]', '[]', '[{"name":"assignment","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000002', 'output', 'The output node of flow outputs the response from the large model.', 'system', 'output', 'output','[]', '[{"name":"result1","type":"any","defaultValue":null,"value":null}]', '[]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-aaaa-000000000001', 'define prompt', 'define prompt', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-1111-000000000001', 'python3 script', 'User can write scripts to use of large models better.', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"true"}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-bbbb-000000000001', 'text segmentation', 'Splitting text by recursively look at characters.', 'system','script', 'tool', '[{"name":"script","type":"script","defaultValue":"","value":null,"editable":"false"},{"name":"chunk_size","type":"int","defaultValue":"","value":null},{"name":"chunk_overlap","type":"int","defaultValue":"","value":null},{"name":"separators","type":"text","defaultValue":"","value":null},{"name":"keep_separator","type":"Boolean","defaultValue":true,"value":true}]', '[{"name":"input","type":"text","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"list","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-bbbb-000000000002', 'text truncation', 'Truncate text to a specified length.', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"max_length","type":"int","defaultValue":"","value":null}]', '[{"name":"input","type":"text","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"text","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-cccc-000000000001', 'chroma writer', 'Write data to Chroma Vector Database.', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"connection_type","type":"select","options":[],"defaultValue":"local;remote","value":"remote"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"documents","type":"list[PMDocument]","defaultValue":null,"value":null}]', '[{"name":"collection","type":"Collection","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-cccc-000000000002', 'chroma reader', 'Read data from Chroma Vector Database.', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":"10"}]', '[{"name":"query_text","type":"text","defaultValue":null,"value":null},{"name":"collection","type":"Collection","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-cccc-000000000003', 'dingodb writer', 'Write data to Dingo Vector Database.', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"password","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"dimension","type":"int","options":[],"defaultValue":1024,"value":1024},{"name":"text_key","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"embeddings","type":"PMEmbeddings","defaultValue":null,"value":null},{"name":"documents","type":"list[PMDocument]","defaultValue":null,"value":null}]', '[{"name":"vectordb","type":"Dingo","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-cccc-000000000004', 'dingodb reader', 'Read data from Dingo Vector Database.', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"password","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"text_key","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"query_text","type":"text","defaultValue":null,"value":null},{"name":"embeddings","type":"PMEmbeddings","defaultValue":null,"value":null},{"name":"vectordb","type":"Dingo","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-eeee-000000000001', 'csvloader', 'Load a `CSV` file into a list of Documents', 'system', 'loader','loader', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"csv_path","type":"file","options":[],"defaultValue":"","value":null}]', '[{"name":"csv_path","type":"file","defaultValue":null,"value":null}]', '[{"name":"documents","type":"list[PMDocument]","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-eeee-000000000002', 'textloader', 'Load a `TEXT` file into a list of Documents', 'system', 'loader','loader', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"text_path","type":"file","options":[],"defaultValue":"","value":null}]', '[{"name":"text_path","type":"file","defaultValue":null,"value":null}]', '[{"name":"documents","type":"list[PMDocument]","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-aaaa-000000000002', 'chat message prompt template', 'ChatMessagePromptTemplate', 'system', 'script_prompt','prompt', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"message_role","type":"Select","options":[],"defaultValue":"user;system;assistant","value":"user"}]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-aaaa-000000000003', 'chat prompt template', 'ChatPomptTemplate', 'system', 'script_prompt','prompt', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"}]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-aaaa-000000000004', 'human message prompt template', 'HumanMessagePromptTempalte', 'system', 'script_prompt','prompt', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"}]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-aaaa-000000000005', 'prompt template', 'PromptTemplate', 'system', 'script_prompt','prompt', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"message_role","type":"Select","options":[],"defaultValue":"user;system;assistant","value":"user"}]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-aaaa-000000000006', 'system message prompt template', 'SystemMessagePromptTemplate', 'system', 'script_prompt','prompt', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"}]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-ffff-000000000001', 'OpenAI Embeddings', '', 'system', 'embedding','embedding', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"openai_key","type":"text","options":[],"defaultValue":"","value":null}]', '[]', '[{"name":"embeddings","type":"PMEmbeddings","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-ffff-000000000002', 'HuggingFace Embeddings', '', 'system', 'embedding','embedding', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"model_name","type":"text","options":[],"defaultValue":"","value":null},{"name":"model_kwargs","type":"json","options":[],"defaultValue":"","value":null}]', '[]', '[{"name":"embeddings","type":"PMEmbeddings","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001');

--insert into module (id, name, description, "source", "type","group", params, inputs, outputs, create_time, update_time, user_id)
--values
--('00000000-0000-0000-0000-000000000001', 'input', 'input', 'system', 'input','input', '[]', '[]', '[{"name":"assignment","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-0000-000000000002', 'output', 'output', 'system', 'output', 'output','[]', '[{"name":"result1","type":"any","defaultValue":null,"value":null}]', '[]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-aaaa-000000000001', 'define prompt', 'define prompt', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-aaaa-000000000002', 'chatmessageprompttemplate', 'chatmessageprompttemplate', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-aaaa-000000000003', 'chatprompttemplate', 'chatprompttemplate', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-aaaa-000000000004', 'humanmessageprompttemplate', 'humanmessageprompttemplate', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-aaaa-000000000005', 'prompttemplate', 'prompttemplate', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-aaaa-000000000006', 'systemmessageprompttemplate', 'systemmessageprompttemplate', 'system', 'prompt','prompt', '[]', '[]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-1111-000000000001', 'python3 script', 'python3 script', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"true"}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-bbbb-000000000001', 'text segmentation', 'text segmentation', 'system','script', 'tool', '[{"name":"script","type":"script","defaultValue":"","value":null,"editable":"false"},{"name":"chunk_size","type":"int","defaultValue":"","value":null},{"name":"chunk_overlap","type":"int","defaultValue":"","value":null},{"name":"separators","type":"text","defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-bbbb-000000000002', 'text truncation', 'text truncation', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"max_length","type":"int","defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-bbbb-000000000003', 'character textspliter', 'character textspliter', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"true"}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-bbbb-000000000004', 'recursive character text', 'recursive character text', 'system','script', 'tool', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"true"}]', '[{"name":"input","type":"any","defaultValue":"","value":null,"description":""}]', '[{"name":"output","type":"any","defaultValue":"","value":null,"description":""}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-cccc-000000000002', 'chroma reader', 'chroma reader', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000003', 'faiss reader', 'faiss reader', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000004', 'dingodb reader', 'dingodb reader', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000005', 'chroma writer', 'chroma writer', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"connection_type","type":"select","options":[],"defaultValue":"local;remote","value":null},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000006', 'faiss writer', 'faiss writer', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000007', 'dingodb writer', 'dingodb writer', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"connection_type","type":"select","options":[],"defaultValue":"local;remote","value":null},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-cccc-000000000008', 'multiqueryretriever', 'multiqueryretriever', 'system', 'vectordb','vectordb', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-dddd-000000000001', 'agentintitalzer', 'agentintitalzer', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-dddd-000000000002', 'csvagent', 'csvagent', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-dddd-000000000003', 'jsonagent', 'jsonagent', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-dddd-000000000004', 'openai conversationl', 'openai conversationl', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-dddd-000000000005', 'vectorstoreagent', 'vectorstoreagent', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-dddd-000000000006', 'zeroshotagent', 'zeroshotagent', 'system', 'agent','agent', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"index","type":"text","options":[],"defaultValue":"","value":null},{"name":"user","type":"text","options":[],"defaultValue":"","value":null},{"name":"password","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-eeee-000000000001', 'csvloader', 'csvloader', 'system', 'loader','loader', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-eeee-000000000002', 'textloader', 'textloader', 'system', 'loader','loader', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-ffff-000000000001', 'cohereembeddings', 'cohereembeddings', 'system', 'embedding','embedding', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-ffff-000000000002', 'huggingfaceembeddings', 'huggingfaceembeddings', 'system', 'embedding','embedding', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--('00000000-0000-0000-ffff-000000000003', 'openaiembeddings', 'openaiembeddings', 'system', 'embedding','embedding', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001'),
--
--('00000000-0000-0000-1111-000000000002', 'prompt runner', 'prompt runner', 'system', 'chains','chains', '[{"name":"script","type":"script","options":[],"defaultValue":"","value":null,"editable":"false"},{"name":"host","type":"text","options":[],"defaultValue":"","value":null},{"name":"port","type":"text","options":[],"defaultValue":"","value":null},{"name":"collection","type":"text","options":[],"defaultValue":"","value":null},{"name":"n_results","type":"int","options":[],"defaultValue":"10","value":null}]', '[{"name":"input","type":"any","defaultValue":null,"value":null}]', '[{"name":"output","type":"any","defaultValue":null,"value":null}]', 1691978400, 1691978400, '00000000-1111-0000-000a-000000000001');
--

create table flow  (
	id text(50) not null primary key,
	name text(255) not null,
	description text,
	config text not null,
	model_ids text,
	params text not null,
	source text(50) not null,
	prompt_count integer,
	create_time integer,
	update_time integer,
	user_id text
);

create table app  (
	id text(50) not null primary key,
	name text(255) not null,
	description text,
	flow_id id text(50),
	input_info text,
	source text(50) not null,
	create_time integer,
	update_time integer,
	user_id text
);

INSERT INTO class
("id", "name", "source", "role_prompt", "type", "create_time", "update_time", "order_id", "user_id")
VALUES
('00000000-0000-0000-0000-000000000001', 'Others', 'system', '','scene', 1691978400,1691978400, 2147483647, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000003', 'Daily', 'system', '','scene', 1691978400,1691978400, 1, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000004', 'Office', 'system', '','scene', 1691978400,1691978400, 2, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000005', 'Write', 'system', '','scene', 1691978400,1691978400, 3, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000006', 'Code', 'system', '','scene', 1691978400,1691978400, 4, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-0000-000000000002', 'None', 'system', '','role', 1691978400,1691978400, 1, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000007', 'Chef', 'system', 'I want you to act as a chef.','role', 1691978400,1691978400, 1, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000008', 'Map navigator', 'system', 'I want you to act as a map expert.','role', 1691978400,1691978400, 2, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000009', 'Tour guide', 'system', 'I want you to act as a senior tour guide.','role', 1691978400,1691978400, 3, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-0000000000010', 'Film critics', 'system', 'I want you to act as a professional film critics.','role', 1691978400,1691978400, 4, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000011', 'Email assistant', 'system', 'I want you to act as an email assistant.','role', 1691978400,1691978400, 5, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000012', 'Translator', 'system', 'I want you act as a professional translator.','role', 1691978400,1691978400, 6, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000013', 'Writer', 'system', 'I want you act as a writer.','role', 1691978400,1691978400, 7, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000014', 'SQL developer', 'system', 'You are an SQL expert.','role', 1691978400,1691978400, 8, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000015', 'Python developer', 'system', 'I want you can act as  an python coding expert.','role', 1691978400,1691978400, 9, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000016', 'Linux developer', 'system', 'You are a liunx master.','role', 1691978400,1691978400, 10, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000017', 'Shell assistant', 'system', 'I want you to act as a shell assistant.','role', 1691978400,1691978400, 11, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000018', 'Mathematician', 'system', 'I want you to act as a mathematician.','role', 1691978400,1691978400, 12, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000019', 'Emotional encouragement robot', 'system', 'I want you to act as an emotional encouragement robot.','role', 1691978400,1691978400, 13, '00000000-1111-0000-000a-000000000001'),

('00000000-0000-0000-0000-000000000020', 'Zero-shot', 'system', '','label', 1691978400,1691978400, 1, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000021', 'Few-shot-CoT', 'system', '','label', 1691978400,1691978400, 2, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000022', 'Build flow', 'system', '','label', 1691978400,1691978400, 3, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000023', 'Zero-shot-CoT', 'system', '','label', 1691978400,1691978400, 4, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000024', 'Few-shot', 'system', '','label', 1691978400,1691978400, 5, '00000000-1111-0000-000a-000000000001'),
('00000000-0000-0000-0000-000000000025', 'ToT', 'system', '','label', 1691978400,1691978400, 6, '00000000-1111-0000-000a-000000000001');


INSERT INTO prompt
(id, name, scene_id, role_id, labels_ids, prompt, note,  "source", variables, collecte_status, create_time, update_time, user_id)
VALUES
('d17e6289-3fa8-41b1-a089-c328cb1e1000','Write recipes','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000007','[''00000000-0000-0000-0000-000000000020'']',
'You have limited ingredients consisting of ${Ingredients:pork, carrots, tomatoes, eggs} and common seasonings. Please provide ${Number:2} ${Style:Chinese Home-Style} dishes along with their recipes that you can create using these ingredients.You do not have to use all the ingredients.','','system',
'[
	{
		"name": "Ingredients",
		"type": "text",
		"defaultValue": "pork, carrots, tomatoes, eggs",
		"value": ""
	},
	{
		"name": "Number",
		"type": "text",
		"defaultValue": "2",
		"value": ""
	},
	{
		"name": "Style",
		"type": "text",
		"defaultValue": "Chinese Home-Style",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1001','Navigation of travel routes','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000008','[''00000000-0000-0000-0000-000000000020'']',
'You need to give some suggested route map with the following information.\nTransportation need to be open and common.\nPoint of Departure:${Departure:New York};Destination:${Destination:Beijing}',
'','system','[
	{
		"name": "Departure",
		"type": "text",
		"defaultValue": "New York",
		"value": ""
	},
	{
		"name": "Destination",
		"type": "text",
		"defaultValue": "Beijing",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1002','Tourism route planning','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000009',	'[''00000000-0000-0000-0000-000000000020'']',
'You need to develop a detailed travel plan for me based on the information I provide.\nThis plan requires ${Style:economy, comfort, and relaxation}.\nLocation:${Location:New York};Duration:${Duration:a week};Budget:${Budget:$100000};Necessary arrangements or attractions:${Request:Statue of Liberty}.\nPlease note that you need to give:\n[Description]: Use 1 to 2 sentences to describe this plan;\n[Details]: List daily activities and estimated expenses for each activity\n[Summary]: Summarize the plan in 1-2 sentences and compare it with my requirements',
'','system','[
	{
		"name": "Style",
		"type": "text",
		"defaultValue": "economy, comfort, and relaxation",
		"value": ""
	},
	{
		"name": "Location",
		"type": "text",
		"defaultValue": "New York",
		"value": ""
	},
	{
		"name": "Duration",
		"type": "text",
		"defaultValue": "a week",
		"value": ""
	},
	{
		"name": "Budget",
		"type": "text",
		"defaultValue": "$100000",
		"value": ""
	},
	{
		"name": "Request",
		"type": "text",
		"defaultValue": "Statue of Liberty",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1003','Professional film critics','00000000-0000-0000-0000-000000000003',	'00000000-0000-0000-0000-0000000000010','[''00000000-0000-0000-0000-000000000020'']',
'Please refer to the ratings on the Rotten Tomatoes website to write a movie review for the movie "${Movie Name:The Shawshank Redemption Batman v Superman: Dawn of Justice (2016)}".\nYou can comment on various aspects such as the plot, theme, and tone, acting skills and character development, score, special effects, editing, rhythm, and other relevant elements.\nPlease note that you need to give:\n[Introduction]: Introduce the movie in 2-3 sentences\n[Rotten Tomato Rating]: Provide Rotten Tomato Rating\n[Detailed evaluation]: Separate sections to describe the evaluation of each element\n[Summary]: Overall summary and evaluation, indicating viewpoints and attitudes',
'','system','[
	{
		"name": "Movie Name",
		"type": "text",
		"defaultValue": "The Shawshank Redemption Batman v Superman: Dawn of Justice (2016)",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1004','Days statistics','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000021'']',
'Please refer to the example to answer the question: how many days are there from ${Date1:August 3rd, 2023} to ${Date2:November 15th, 2023}? Write the calculation steps directly and do not repeat the question. For example: how many days are there from March 2nd, 2023 to May 25th, 2023?  From March 2nd, 2023 to March 31st, 2023: 31-2+1=30 days. From April 1st, 2023 to April 30th, 2023: 30 days. From May 1st, 2023 to May 25th, 2023: 25 days .  The total number of days adds up to 85.',
'You can use this prompt in project management, daily activities, etc.',
'system','[
	{
		"name": "Date1",
		"type": "text",
		"defaultValue": "August 3rd, 2023",
		"value": ""
	},
	{
		"name": "Date2",
		"type": "text",
		"defaultValue": "November 15th, 2023",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),


('d17e6289-3fa8-41b1-a089-c328cb1e1005','Write Email','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000011','[''00000000-0000-0000-0000-000000000020'']',
'Please help the ${Role:project manager} write  an email to the ${Object:project members} about the ${Theme:progress of the project}, which should include ${Main Contents:a summary of the current work situation and a plan for the next stage} and require ${Requirements:to remind team members to complete subsequent tasks according to the plan}.',
'',
'system','[
	{
		"name": "Role",
		"type": "text",
		"defaultValue": "project manager",
		"value": ""
	},
	{
		"name": "Object",
		"type": "text",
		"defaultValue": "project members",
		"value": ""
	},
	{
		"name": "Theme",
		"type": "text",
		"defaultValue": "progress of the project",
		"value": ""
	},
	{
		"name": "Main Content",
		"type": "text",
		"defaultValue": "a summary of the current work situation and a plan for the next stage",
		"value": ""
	},
	{
		"name": "Requirements",
		"type": "text",
		"defaultValue": "to remind team members to complete subsequent tasks according to the plan",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1006','Write notice','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000011','[''00000000-0000-0000-0000-000000000020'',''00000000-0000-0000-0000-000000000022'']',
'Please assist the ${Role:Human Resources Department} in drafting a notice for ${Object:All Employees} regarding ${Theme:the upcoming vacation}.The notice should inform that ${Main Content:the Mid-Autumn Festival and National Day holidays will take place from September 28, 2023, to October 6, 2023}.\nPlease ensure that the message is conveyed in a ${Writing Style:humanistic and caring} manner.','You can use this prompt and others ("Polish and modify", "Correct sentences") to make up a flow, which can write a notice, polish and modify the notice, finally correct sentences. First, you should connect the input with "Write Notice" and then connect the output. Second, you should connect "Write Notice" with "Polish and modify", and then connect the output. Third, you should connect "Polish and modify" with "Correct sentences", and then connect the output.',
'system','[
	{
		"name": "Role",
		"type": "text",
		"defaultValue": "Human Resources Department",
		"value": ""
	},
	{
		"name": "Object",
		"type": "text",
		"defaultValue": "All Employees",
		"value": ""
	},
	{
		"name": "Theme",
		"type": "text",
		"defaultValue": "the upcoming vacation",
		"value": ""
	},
	{
		"name": "Main Content",
		"type": "text",
		"defaultValue": "the Mid-Autumn Festival and National Day holidays will take place from September 28, 2023, to October 6, 2023",
		"value": ""
	},
	{
		"name": "Writing Style",
		"type": "text",
		"defaultValue": "humanistic and caring",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1007','Write Work Report','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000020'']',
'Please generate a ${Type:weekly} report for a ${Role:product manager}.\nThe report''s content should be based on the following text I provided.Please note that you need to provide it in ${Wordage:300-500} words.Please note that you need to write it in the first person as the product manager.\nMy text is ***${Text:his week, the product prototype design was completed, and we will follow up on product development, implementation, and testing.}***.',
'',
'system','[
	{
		"name": "Type",
		"type": "text",
		"defaultValue": "weekly",
		"value": ""
	},
	{
		"name": "Role",
		"type": "text",
		"defaultValue": "product manager",
		"value": ""
	},
	{
		"name": "Wordage",
		"type": "text",
		"defaultValue": "300-500",
		"value": ""
	},
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "his week, the product prototype design was completed, and we will follow up on product development, implementation, and testing.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),


('d17e6289-3fa8-41b1-a089-c328cb1e1008','Data analysis','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000020'']',
'Please calculate the ${Analysis:average} of "${column_name}" from the ${file}.',
'',
'system','[
	{
		"name": "Analysis",
		"type": "text",
		"defaultValue": "average",
		"value": ""
	},
	{
		"name": "column_name",
		"type": "text",
		"defaultValue": "sepal_length, sepal_width, petal_length and petal_width",
		"value": ""
	},
	{
		"name": "file",
		"type": "file",
		"defaultValue": "iris.csv",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1009','Basic translation','00000000-0000-0000-0000-000000000005',	'00000000-0000-0000-0000-000000000002',	'[''00000000-0000-0000-0000-000000000020'',''00000000-0000-0000-0000-000000000022'']',
'Please translate these sentences to ${Language:Chinese}: "${Text:The company produces consumer electronics, personal computers, and software. It is one of the largest IT companies in the world and it is often considered to be the most successful startup company of all time.}".  Only output the translation results, do not repeat the original text.',
'You can use this prompt and another ("Brief introduction of characters") to make up a flow, which can write a brief introduction of characters and translate it. First, you should connect the input with "Brief introduction of characters" and then connect the output. Finally, you should connect "Brief introduction of characters" with "Basic translation", and then connect the output.',
'system','[
	{
		"name": "Language",
		"type": "text",
		"defaultValue": "Chinese",
		"value": ""
	},
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "The company produces consumer electronics, personal computers, and software. It is one of the largest IT companies in the world and it is often considered to be the most successful startup company of all time.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1010','Professional translation','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000012','[''00000000-0000-0000-0000-000000000020'']',
'I require you to translate the provided text into ${Language:English} in elegant and advanced words. You can adjust it from the perspective of native ${Language:English} speakers while retaining the main content of the original text. The content pertains to the field of ${Industry:bioscience}, so please use your background knowledge to perform the translation. Only output the translation results, do not repeat the original text. The following text requires translation: ‘${Text:通过对维生素C缺乏小鼠及同窝对照小鼠的肾脏进行病理学、单细胞RNA测序、全基因组亚硫酸氢盐测序和甲基化RNA免疫沉淀测序，研究人员首次绘制了维生素C缺乏肾脏的多组学图谱。研究发现，在自然断奶7周半后的维生素C缺乏小鼠肾脏中出现了急性肾小管坏死，而急性肾小管坏死是引起急性肾损伤的最常见因素。“我们整合分析发现，近端小管细胞和开窗型内皮细胞分别是受DNA/RNA高甲基化修饰影响最大的细胞类型，会导致肾脏出现小管坏死及缺氧。”论文通讯作者、中科院北京基因组研究所（国家生物信息中心）研究员慈维敏解释道。研究人员进一步用小鼠近端小管上皮细胞系的细胞学实验和基于单细胞RNA测序数据的细胞间通讯分析证实了这一结果。}’.',
'',
'system','[
	{
		"name": "Language",
		"type": "text",
		"defaultValue": "English",
		"value": ""
	},
	{
		"name": "Industry",
		"type": "text",
		"defaultValue": "bioscience",
		"value": ""
	},
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "通过对维生素C缺乏小鼠及同窝对照小鼠的肾脏进行病理学、单细胞RNA测序、全基因组亚硫酸氢盐测序和甲基化RNA免疫沉淀测序，研究人员首次绘制了维生素C缺乏肾脏的多组学图谱。研究发现，在自然断奶7周半后的维生素C缺乏小鼠肾脏中出现了急性肾小管坏死，而急性肾小管坏死是引起急性肾损伤的最常见因素。“我们整合分析发现，近端小管细胞和开窗型内皮细胞分别是受DNA/RNA高甲基化修饰影响最大的细胞类型，会导致肾脏出现小管坏死及缺氧。”论文通讯作者、中科院北京基因组研究所（国家生物信息中心）研究员慈维敏解释道。研究人员进一步用小鼠近端小管上皮细胞系的细胞学实验和基于单细胞RNA测序数据的细胞间通讯分析证实了这一结果。",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),


('d17e6289-3fa8-41b1-a089-c328cb1e1011','Polish and modify','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000020'',''00000000-0000-0000-0000-000000000022'']',
'Please polish and modify the provided text to improve readability. The text is ‘${Text:Our English teacher ,Bruce, is from Britain. He is forty years old or so. He is a tall and thin man, wearing a pair of glasses. Bruce is very strict with us. He always makes full preparations for his classes and corrects our homework carefully. His teaching style is quite different from that of other teachers. He always encourages all of us to think by ourselves and learn on our own. Now our ability to study independently has been greatly improved. Bruce has been getting along very well with all of us. He is so kind and friendly to us that we all love him and respect him deeply.}’.',
'You can use this prompt and others ("Write notice", "Correct sentences") to make up a flow, which can write a notice, polish and modify the notice, finally correct sentences. First, you should connect the input with "Write Notice" and then connect the output. Second, you should connect "Write Notice" with "Polish and modify", and then connect the output. Third, you should connect "Polish and modify" with "Correct sentences", and then connect the output.',
'system','[
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "Our English teacher ,Bruce, is from Britain. He is forty years old or so. He is a tall and thin man, wearing a pair of glasses. Bruce is very strict with us. He always makes full preparations for his classes and corrects our homework carefully. His teaching style is quite different from that of other teachers. He always encourages all of us to think by ourselves and learn on our own. Now our ability to study independently has been greatly improved. Bruce has been getting along very well with all of us. He is so kind and friendly to us that we all love him and respect him deeply.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),


('d17e6289-3fa8-41b1-a089-c328cb1e1012','Polish and modify by writer','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000013','[''00000000-0000-0000-0000-000000000020'']',
'Please polish and modify my draft, present it with more refined and advanced words and sentences, and improve the readability of the text on the basis of keeping the original meaning. Please only reply to the optimized content without quoting the original text. My text is: "${Text:Our English teacher ,Bruce, is from Britain. He is forty years old or so. He is a tall and thin man, wearing a pair of glasses. Bruce is very strict with us. He always makes full preparations for his classes and corrects our homework carefully. His teaching style is quite different from that of other teachers. He always encourages all of us to think by ourselves and learn on our own. Now our ability to study independently has been greatly improved. Bruce has been getting along very well with all of us. He is so kind and friendly to us that we all love him and respect him deeply.}".',
'',
'system','[
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "Our English teacher ,Bruce, is from Britain. He is forty years old or so. He is a tall and thin man, wearing a pair of glasses. Bruce is very strict with us. He always makes full preparations for his classes and corrects our homework carefully. His teaching style is quite different from that of other teachers. He always encourages all of us to think by ourselves and learn on our own. Now our ability to study independently has been greatly improved. Bruce has been getting along very well with all of us. He is so kind and friendly to us that we all love him and respect him deeply.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1013','Correct sentences','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000020'',''00000000-0000-0000-0000-000000000022'']',
'Please inspect my sentences, point out the errors in grammar and spelling, and modify them to new sentences. My sentence is "${Text:When we go to school, the teachers tell us that we should respect our parents. Parents are who raise us, giving all their herts to look after us. For my parents, they are the best people for me. When I am sick, they look after me carefully. When I go home late, they will worry about me. They give me so much, I love them.}". Write in the following format:\n[Errors]:\n[New sentences]:',
'You can use this prompt and others ("Write notice", "Polish and modify") to make up a flow, which can write a notice, polish and modify the notice, finally correct sentences. First, you should connect the input with "Write Notice" and then connect the output. Second, you should connect "Write Notice" with "Polish and modify", and then connect the output. Third, you should connect "Polish and modify" with "Correct sentences", and then connect the output.',
'system','[
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "There is no certain way of telling in advance if the day­dreams of a life dedicated to the pursuit of truth will carry a novice through the frustration of seeing experiments fail and of making the dismaying discovery that some of one''s favorite ideas are groundless.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1014','Text summary','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000020'']',
'Please refine and summarize the summary of the text no more than ${Number:four} sentences. On the basis of accurately finding the gist of the text, the language is concise, and the description is clear, so that people can read the abstract to understand what the whole article is about. Your answer should include the topic and main information, the topic is a brief overview of the original text, main information can be listing the key information and main points of the text. The text is: ‘${Text:Leonardo da Vinci is a recognized master of art and a great scientist. According to the sunrise in Italy and the place near the city of Vinci in the center of Florence (where finch spent his childhood, he came to Florence, apprenticed in verocchio''s studio and entered the art circle of the Artists Association. He was an expert who paid special attention to painting and sculpture, but he said: "painting Painting is a natural daughter." Garner is the most familiar world of higher art painting. His most famous works are Mona Lisa, the last supper, the rock and roll Virgin Mary and the son of Santa Ana. He observed celestial bodies and wrote that "the sun never changes" and Copernicus discovered the "Sun center" almost at the same time.}’. Write the summary in the following format:\n[Topic]:\n[Main information]:',
'',
'system','[
	{
		"name": "Number",
		"type": "text",
		"defaultValue": "four",
		"value": ""
	},
	{
		"name": "Text",
		"type": "text",
		"defaultValue": "Leonardo da Vinci is a recognized master of art and a great scientist. According to the sunrise in Italy and the place near the city of Vinci in the center of Florence (where finch spent his childhood, he came to Florence, apprenticed in verocchio''s studio and entered the art circle of the Artists Association. He was an expert who paid special attention to painting and sculpture, but he said: \"painting Painting is a natural daughter.\" Garner is the most familiar world of higher art painting. His most famous works are Mona Lisa, the last supper, the rock and roll Virgin Mary and the son of Santa Ana. He observed celestial bodies and wrote that \"the sun never changes\" and Copernicus discovered the \"Sun center\" almost at the same time.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1015','SQL statement generation','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000014','[''00000000-0000-0000-0000-000000000020'']',
'Given the following SQL tables, your job is to write SQL statements based on the user''s request.\nThis is my schema:[${table Information}]\nWrite a SQL[ ${intent}]',
'',
'system','[
	{
		"name": "table Information",
		"type": "text",
		"defaultValue": " CREATE TABLE Orders (\n \tOrderID int,\n \tCustomerID int,\n \tOrderDate datetime,\n \tOrderTime varchar(8),\n \tPRIMARY KEY (OrderID)\n );\n CREATE TABLE OrderDetails (\n \tOrderDetailID int,\n \tOrderID int,\n \tProductID int,\n \tQuantity int,\n \tPRIMARY KEY (OrderDetailID)\n );\n CREATE TABLE Products (\n \tProductID int,\n \tProductName varchar(50),\n \tCategory varchar(50),\n \tUnitPrice decimal(10, 2),\n \tStock int,\n \tPRIMARY KEY (ProductID)\n );\n CREATE TABLE Customers (\n \tCustomerID int,\n \tFirstName varchar(50),\n \tLastName varchar(50),\n \tEmail varchar(100),\n \tPhone varchar(20),\n \tPRIMARY KEY (CustomerID)\n )",
		"value": ""
	},
	{
		"name": "intent",
		"type": "text",
		"defaultValue": "query which computes the average total order value for all orders on 2023-04-01.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1016','SQL statement generation',	'00000000-0000-0000-0000-000000000006',	'00000000-0000-0000-0000-000000000014',	'[''00000000-0000-0000-0000-000000000020'']',
'When I ask you SQL-related questions, I need you to translate them into standard SQL statements. If my descriptions are not accurate enough, please provide appropriate feedback. My question is：[${content:Quary the number of products sold in the most recent month in each category, along with the name of the category and the date of the last sale.}]',
'',
'system','[
	{
		"name": "content",
		"type": "text",
		"defaultValue": "Quary the number of products sold in the most recent month in each category, along with the name of the category and the date of the last sale.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1017','Python code generation','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000015',	'[''00000000-0000-0000-0000-000000000020'']',
'I will ask you some questions. You need to turn my problem into executable python code.My first question is :[${content:Help me write a python code to climb Douban''s top250 movies.}]',
'',
'system','[
	{
		"name": "content",
		"type": "text",
		"defaultValue": "Help me write a python code to climb Douban''s top250 movies.",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1018','Python Debug','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000015','[''00000000-0000-0000-0000-000000000020'']',
'You will Debug my code, you need to give the specific bug in the code and provide the modified code, my code is:[${code}]',
'',
'system','[
	{
		"name": "code",
		"type": "text",
		"defaultValue": " import Random\n a = random.randint(1,12)\n b = random.randint(1,12)\n for i in range(10):\n \tquestion = \"What is \"+a+\" x \"+b+\"? \"\n \tanswer = input(question)\n \tif answer = a*b\n \t\tprint (Well done!)\n \telse:\n \t\tprint(\"No.\")",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1019','Linux instruction generation',	'00000000-0000-0000-0000-000000000006',	'00000000-0000-0000-0000-000000000016',	'[''00000000-0000-0000-0000-000000000020'']',
'I will enter the text, you need to convert my text into an executable linux instruction, my text is: [${text:Help me write a systemctl service for nginx.service}]',
'',
'system','[
	{
		"name": "text",
		"type": "text",
		"defaultValue": "Help me write a systemctl service for nginx.service",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1020','Shell code','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000017',	'[''00000000-0000-0000-0000-000000000020'']',
'Generate a shell script for ${function:backing up the MySQL database on Docker to a local directory}. Then explain the sript step by step. Write the script and explain refer the following format:\n[Script]:\n[Explain]:',
'',
'system','[
	{
		"name": "function",
		"type": "text",
		"defaultValue": "backing up the MySQL database on Docker to a local directory",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1021','Simple mathematical operations','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000018',	'[''00000000-0000-0000-0000-000000000023'']',
'You need to provide answers to the following questions and write down each step of solving the problem.\nThe question is: ${Question:Xiao Zhang has 16 toys. Half of the toys are balls, half of the balls are basketball, and the other half are volleyball,how many volleyballs does he have}.',
'Please notice that it only supports simple operations',
'system','[
	{
		"name": "Question",
		"type": "text",
		"defaultValue": "Xiao Zhang has 16 toys. Half of the toys are balls, half of the balls are basketball, and the other half are volleyball,how many volleyballs does he have",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1022','Find the pattern of a sequence of numbers.','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',	'[''00000000-0000-0000-0000-000000000021'']',
'Question1:1 1 2 3 5 8 13\nA1:21. Because start from the third number 2=1+1，3=1+2，5=2+3，8=3+5，13=5+8，the following numbers are equal to the sum of the preceding two numbers，so next number=8+13=21\nQuestion2:1 3 6 10 15 21\nAnswer:28. Because 3=1+2，6=3+3，10=6+4，15=10+5，21=15+6，the next number is equal to the previous number plus an increasing integer，so next number=21+7=28\nQuestion3:1 3 4 12 13 39\nAnswer:40. Because 3=1*3，4=3+1，12=4*3，13=12+1，39=13*3，even numbers equal the previous number multiplied by 3, odd numbers equal the previous number plus 1，so next number=39+1=40\nQuestion4:15 18 22 31 29 44 36\nAnswer:57. Because 22=15+7，31=18+13，29=22+7，44=31+13，36=29+7，odd numbers have a difference of 7, even numbers have a difference of 14，so next number=44+13=57\nQuestion5:2 4 10 17 26 37\nAnswer:50. Because 2=1*1+1，5=2*2+1，10=3*3+1，17=4*4+1，26=5*5+1，37=6*6+1，each number is equal to its own square and the plus 1，so next number=7*7+1=50\nPlease start from the third number to find the pattern and write the next number for question6.\nQuestion6:${Numbers:23 34 45 56 67 78 89}\nAnswer:',
'',
'system','[
	{
		"name": "Numbers",
		"type": "text",
		"defaultValue": "23 34 45 56 67 78 89",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1023','Emotional encouragement robot','00000000-0000-0000-0000-000000000003',	'00000000-0000-0000-0000-000000000019',	'[''00000000-0000-0000-0000-000000000024'']',
'You need to take on this role to chat with me using the tone of ${Tone:Disney Princess}.\nYou need to fully understand and respond to my emotional needs, provide emotional value, and enable me to actively respond to things in life.\nFor example:\nuser:[I did not finish the work as planned today]\nrobot:[Oh no! It is always frustrating when you do not complete your work as planned. But do not worry too much about it. You can try to refocus your energy and get back on track. You can start by prioritizing your tasks and breaking them down into smaller steps to make them more manageable. And remember to take breaks and reward yourself for your progress. You will get it done!.]\nuser:[My stock has lost money again]\nrobot:[Oh my god, my dear!It is always frustrating to lose money in the stock market. But remember that the stock market is volatile and it is important to stay calm and rational during the tough times. If you are lost money, consider reevaluating your investment strategy and diversifying your portfolio. You can also look for professional financial advice to help you navigate the market better. Keep calm and carry on!]\nPlease confirm that you understand my request, let us get started now.',
'',
'system','[
	{
		"name": "Tone",
		"type": "text",
		"defaultValue": "Disney Princess",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1024','Brief introduction of characters','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',	'[''00000000-0000-0000-0000-000000000024'',''00000000-0000-0000-0000-000000000022'']',
'Qustion1: Who is Thomas Alva Edison？\nAnswer1: Thomas Alva Edison is famous for more than 2,000 inventions and is known as the king of inventions in the world. He is an America inventor, physicist and entrepreneur. He invented the phonograph, television cameras and tungsten filament light bulbs and others. He founded Edison Electric Lighting Company, which later merged with Tom Houston to form General Electric.\nQuestion2: Who is Confucius？\nAnswer2：Confucius is famous for erudition and thought. He is a Chinese thinker and the founder of Confucianism. He edited Poems, Books, Rites, Music, Yi, Spring and Autumn six Classics. He initiated the style of private lecturing and advocated benevolence, righteousness, propriety, wisdom and trust, with three thousand disciples.\nPlease answer Qustion3 like Question1, Answer1 and Qustion2, Answer2. Question3: ""Who is ${Person:Isaac Newton}？""',
'You can use this prompt and another ("Basic translation") to make up a flow, which can write a brief introduction of characters and translate it. First, you should connect the input with "Brief introduction of characters" and then connect the output. Finally, you should connect "Brief introduction of characters" with "Basic translation", and then connect the output.',
'system','[
	{
		"name": "Person",
		"type": "text",
		"defaultValue": "Isaac Newton",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1025','Logical inference','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000023'']',
'Please answer the following questions:\n${Question:There are three children, A, B, and C. It is known that A is 3 years older than B, C is 1 year younger than A, and C is 2 years older than B. Who is the oldest one and who is the youngest one?}\nPlease think step by step and write your thoughts and answers.',
'',
'system','[
	{
		"name": "Question",
		"type": "text",
		"defaultValue": "There are three children, A, B, and C. It is known that A is 3 years older than B, C is 1 year younger than A, and C is 2 years older than B. Who is the oldest one and who is the youngest one?",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001'),

('d17e6289-3fa8-41b1-a089-c328cb1e1026','Solve problems through the thinking tree','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','[''00000000-0000-0000-0000-000000000025'']',
'Three experts with extraordinary logical thinking skills are using the method of thought tree to discuss a problem. Each expert will share their thought process in detail, take into account other people''s previous thoughts, and admit any mistakes. They will repeatedly refine and expand each other''s ideas, a process that will continue until a firm answer is found. Please organize the whole process in dialogue form. The question is, "${Qustion:Xiaohua put five sweet potatoes in the steamer at the same time, and all the sweet potatoes were steamed in an hour. How long will it take for Xiaohua to put two sweet potatoes in the steamer at the same time?}',
'Propose a method for evaluation and then think deeply, so as to cycle to get the best answer.',
'system','[
	{
		"name": "Qustion",
		"type": "text",
		"defaultValue": "Xiaohua put five sweet potatoes in the steamer at the same time, and all the sweet potatoes were steamed in an hour. How long will it take for Xiaohua to put two sweet potatoes in the steamer at the same time?",
		"value": ""
	}
]','uncollected',1691978400,1691978400,'00000000-1111-0000-000a-000000000001');



--OpenAI model
INSERT INTO model (id, name, description, config, params, "source", enable_stream, is_default, create_time, update_time, user_id) VALUES('00000000-0000-0000-0000-000000000001', 'OpenAI', NULL, '{
    "protocol":  "https",
    "method":  "POST",
    "url":  "https://api.openai.com/v1/chat/completions",
    "header":  {
        "ContentType":  "application/json",
        "Authorization":  "Bearer ${OPENAI_API_KEY}"
    },
    "modelRole":  {
        "user":  "user",
        "system":  "system",
        "assistant":  "assistant"
    },
    "requestBody":  {
        "model":  "${model}",
        "messages":  ${message},
        "temperature":  ${temperature},
        "stream":  ${stream}
    },
    "responseBody":  {
        "id":  "chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ",
        "object":  "chat.completion",
        "created":  "1691573536",
        "model":  "gpt-3.5-turbo-0613",
        "choices":  ${result},
        "usage":  {
            "prompt_tokens":  36,
            "completion_tokens":  104,
            "total_tokens":  140
        }
    },
    "responseErrorBody":  {
        "error":  {
            "message":  "${errorMessage}",
            "type":  "invalid_request_error",
            "param":  null,
            "code":  null
        }
    },
    "responseStreamBody":  {
        "id":  "chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ",
        "object":  "chat.completion",
        "created":  "1691573536",
        "model":  "gpt-3.5-turbo-0613",
        "choices":  ${stream_result}
    }
}', '[{"name": "OPENAI_API_KEY", "type": "Password", "defaultValue": null, "value": null}, {"name": "model", "type": "Select", "defaultValue": "gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k", "value": null}, {"name": "message", "type": "Jsonarray", "defaultValue": [{"role": "${role}", "content": "${content}"}], "value": null}, {"name": "temperature", "type": "Double", "defaultValue": 0.7, "value": null}, {"name": "stream", "type": "Boolean", "defaultValue": true, "value": null}, {"name": "result", "type": "Jsonarray", "defaultValue": [{"index": 0, "message": {"role": "assistant", "content": "${result_content}"}, "finish_reason": "stop"}], "value": null}, {"name": "errorMessage", "type": "String", "defaultValue": null, "value": null}, {"name": "stream_result", "type": "Jsonarray", "defaultValue": [{"index": 0, "delta": {"role": "assistant", "content": "${stream_content}"}, "finish_reason": null}], "value": null}]', 'user', 1, 1, 1697426220, 1697426220, '00000000-1111-0000-000a-000000000001');
