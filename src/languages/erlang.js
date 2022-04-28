/*
Language: Erlang
Description: Erlang is a general-purpose functional language, with strict evaluation, single assignment, and dynamic typing.
Author: Nikolay Zakharov <nikolay.desh@gmail.com>, Dmitry Kovega <arhibot@gmail.com>
Website: https://www.erlang.org
Category: functional
*/

/** @type LanguageFn */
export default function(hljs) {
  const BASIC_ATOM_RE = '[a-z\'][a-zA-Z0-9_\']*';
  const FUNCTION_NAME_RE = '(' + BASIC_ATOM_RE + ':' + BASIC_ATOM_RE + '|' + BASIC_ATOM_RE + ')';
  const ERLANG_RESERVED = {
    keyword:
      'after and andalso band begin bnot bor bsl bzr bxor case catch cond div end fun if '
      + 'let not of orelse query receive rem try when xor',
    literal:
      'false true'
  };

  const COMMENT = hljs.COMMENT('%', '$');
  const NUMBER = {
    className: 'number',
    begin: '\\b(\\d+(_\\d+)*#[a-fA-F0-9]+(_[a-fA-F0-9]+)*|\\d+(_\\d+)*(\\.\\d+(_\\d+)*)?([eE][-+]?\\d+)?)',
    relevance: 0
  };
  const NAMED_FUN = { begin: 'fun\\s+' + BASIC_ATOM_RE + '/\\d+' };
  const FUNCTION_CALL = {
    begin: FUNCTION_NAME_RE + '\\(',
    end: '\\)',
    returnBegin: true,
    contains: [
      {
        begin: FUNCTION_NAME_RE
      },
      {
        begin: '\\(',
        end: '\\)',
        endsWithParent: true,
        returnEnd: true
        // "contains" defined later
      }
    ]
  };
  const TUPLE = {
    begin: /\{/,
    end: /\}/
    // "contains" defined later
  };
  const VAR1 = {
    begin: '\\b_([A-Z][A-Za-z0-9_]*)?',
    relevance: 0
  };
  const VAR2 = {
    begin: '[A-Z][a-zA-Z0-9_]*',
    relevance: 0
  };
  const RECORD_ACCESS = {
    begin: '#' + hljs.UNDERSCORE_IDENT_RE,
    returnBegin: true,
    contains: [
      {
        begin: '#' + hljs.UNDERSCORE_IDENT_RE
      },
      {
        begin: /\{/,
        end: /\}/,
        // "contains" defined later
      }
    ]
  };

  const BLOCK_STATEMENTS = {
    beginKeywords: 'fun receive if try case',
    end: 'end',
    keywords: ERLANG_RESERVED
  };
  BLOCK_STATEMENTS.contains = [
    COMMENT,
    NAMED_FUN,
    hljs.inherit(hljs.APOS_STRING_MODE, { className: '' }),
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1,
    VAR2,
    RECORD_ACCESS
  ];

  const BASIC_MODES = [
    COMMENT,
    NAMED_FUN,
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1,
    VAR2,
    RECORD_ACCESS
  ];
  FUNCTION_CALL.contains[1].contains = BASIC_MODES;
  TUPLE.contains = BASIC_MODES;
  RECORD_ACCESS.contains[1].contains = BASIC_MODES;

  const DIRECTIVES = [
    "-module",
    "-record",
    "-undef",
    "-export",
    "-ifdef",
    "-ifndef",
    "-author",
    "-copyright",
    "-doc",
    "-vsn",
    "-import",
    "-include",
    "-include_lib",
    "-compile",
    "-define",
    "-else",
    "-endif",
    "-file",
    "-behaviour",
    "-behavior",
    "-spec"
  ];

  const PARAMS = {
    className: 'params',
    begin: '\\(',
    end: '\\)',
    contains: BASIC_MODES
  };
  return {
    name: 'Erlang',
    aliases: [ 'erl' ],
    keywords: ERLANG_RESERVED,
    illegal: '(</|\\*=|\\+=|-=|/\\*|\\*/|\\(\\*|\\*\\))',
    contains: [
      {
        begin: '^' + BASIC_ATOM_RE + '\\s*\\(',
        end: '->',
        returnBegin: true,
        illegal: '\\(|#|//|/\\*|\\\\|:|;',
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: BASIC_ATOM_RE, scope: "title.function" })
        ],
        starts: {
          end: ';|\\.',
          keywords: ERLANG_RESERVED,
          contains: BASIC_MODES
        }
      },
      COMMENT,
      {
        begin: '^-',
        end: '\\.',
        excludeEnd: true,
        returnBegin: true,
        keywords: {
          $pattern: '-' + hljs.IDENT_RE,
          keyword: DIRECTIVES.map(x => `${x}|1.5`).join(" ")
        },
        contains: [ PARAMS ]
      },
      NUMBER,
      hljs.QUOTE_STRING_MODE,
      RECORD_ACCESS,
      VAR1,
      VAR2,
      TUPLE,
      { begin: /\.$/ } // relevance booster
    ]
  };
}
