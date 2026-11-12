import { useEffect, useId, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import mermaid from 'mermaid'
import { BookOpen, Lightbulb, Pencil, Target, Sparkles, Youtube } from 'lucide-react'
import 'katex/dist/katex.min.css'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral'
})

function MarkdownContent({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const code = String(children).replace(/\n$/, '')

          if (!match) return <code className="inline-code" {...props}>{children}</code>

          return (
            <div className="code-block">
              <div className="code-toolbar">
                <span>{match[1]}</span>
                <button type="button" onClick={() => navigator.clipboard?.writeText(code)}>
                  Copy code
                </button>
              </div>
              <SyntaxHighlighter language={match[1]} style={oneLight} showLineNumbers wrapLongLines>
                {code}
              </SyntaxHighlighter>
            </div>
          )
        }
      }}
    >
      {children || ''}
    </ReactMarkdown>
  )
}

function Diagram({ source }) {
  const id = useId().replace(/:/g, '')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function render() {
      if (!source?.trim()) return
      try {
        const result = await mermaid.render(`diagram-${id}`, source)
        if (active) {
          setSvg(result.svg)
          setError('')
        }
      } catch {
        if (active) setError('Diagram unavailable. Please refer to the written explanation.')
      }
    }

    render()
    return () => { active = false }
  }, [source, id])

  if (error) return <p className="diagram-error">{error}</p>
  if (!svg) return <p className="muted">Preparing diagram…</p>

  return <div className="mermaid-output" dangerouslySetInnerHTML={{ __html: svg }} />
}

function Section({ icon: Icon, title, children, className = '' }) {
  if (!children) return null
  return (
    <section className={`mentor-section ${className}`}>
      <h3><Icon size={19} /> {title}</h3>
      {children}
    </section>
  )
}

function HandwrittenBoard({ board }) {
  if (!board?.lines?.length) return null

  return (
    <section className="mentor-section">
      <h3><Pencil size={19} /> Let's solve it on our notebook</h3>
      <div className="handwritten-board">
        <div className="notebook-heading">{board.title || 'My Notebook Solution'}</div>
        <div className="notebook-content">
          {board.lines.map((line, index) => (
            <div className={`hand-line hand-${line.type || 'step'}`} key={index}>
              {line.type === 'result' && <span className="result-check">✓</span>}
              <span>{line.text}</span>
            </div>
          ))}
        </div>
        <div className="notebook-footer">PeerConnect AI Mentor · Learn step by step</div>
      </div>
    </section>
  )
}

export default function AnswerRenderer({ answer }) {
  if (!answer) return null

  const hasNewMentorContent =
    answer.problemIntro ||
    answer.simpleExample ||
    answer.keywords?.length ||
    answer.conceptExplanation ||
    answer.solutionSteps?.length ||
    answer.handwrittenBoard?.lines?.length

  return (
    <div className="advanced-answer mentor-answer">
      {answer.summary && (
        <div className="answer-summary">
          <span className="content-kicker">QUICK REVISION</span>
          <MarkdownContent>{answer.summary}</MarkdownContent>
        </div>
      )}

      <Section icon={BookOpen} title="First, understand the problem">
        <MarkdownContent>{answer.problemIntro}</MarkdownContent>
      </Section>

      <Section icon={Lightbulb} title="A simple real-life example">
        <MarkdownContent>{answer.simpleExample}</MarkdownContent>
      </Section>

      <Section icon={Target} title="Important keywords">
        <div className="mentor-keywords">
          {answer.keywords?.map((item, i) => (
            <div className="keyword-card" key={i}>
              <strong>{item.term}</strong>
              <p>{item.meaning}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={BookOpen} title="What is given in the question?">
        <div className="mentor-givens">
          {answer.givens?.map((item, i) => (
            <div className="given-card" key={i}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Lightbulb} title="Understand the concept">
        <MarkdownContent>{answer.conceptExplanation}</MarkdownContent>
      </Section>

      {answer.solutionSteps?.length > 0 && (
        <Section icon={Pencil} title="Let's solve it step by step">
          <div className="mentor-steps">
            {answer.solutionSteps.map((step, i) => (
              <article className="mentor-step" key={i}>
                <div className="step-number">{i + 1}</div>
                <div>
                  <h4>{step.title}</h4>
                  <MarkdownContent>{step.explanation}</MarkdownContent>
                  {step.working && (
                    <div className="step-working">
                      <MarkdownContent>{step.working}</MarkdownContent>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      <HandwrittenBoard board={answer.handwrittenBoard} />

      {answer.body && (
        <Section icon={BookOpen} title="Complete explanation">
          <MarkdownContent>{answer.body}</MarkdownContent>
        </Section>
      )}

      {answer.equations?.length > 0 && (
        <Section icon={Pencil} title="Mathematical formulas">
          <div className="math-notebook">
            {answer.equations.map((equation, i) => (
              <div className="math-line" key={i}>
                <span>{i + 1}</span>
                <MarkdownContent>{`$$${equation}$$`}</MarkdownContent>
              </div>
            ))}
          </div>
        </Section>
      )}

      {answer.diagram && (
        <Section icon={Sparkles} title="Concept diagram">
          <div className="diagram-card"><Diagram source={answer.diagram} /></div>
        </Section>
      )}

      {answer.flowchart?.length > 0 && (
        <Section icon={Target} title="Solution flowchart">
          <div className="mentor-flow">
            {answer.flowchart.map((item, i) => (
              <div className="flow-item" key={i}>
                <div className="flow-node">{item}</div>
                {i !== answer.flowchart.length - 1 && <div className="flow-arrow">↓</div>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {answer.codeBlocks?.length > 0 && (
        <Section icon={BookOpen} title="Code workspace">
          {answer.codeBlocks.map((block, i) => (
            <div className="generated-code" key={i}>
              <p>{block.explanation}</p>
              <div className="code-block">
                <div className="code-toolbar">
                  <span>{block.language}</span>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(block.code)}>
                    Copy code
                  </button>
                </div>
                <SyntaxHighlighter language={block.language} style={oneLight} showLineNumbers wrapLongLines>
                  {block.code}
                </SyntaxHighlighter>
              </div>
            </div>
          ))}
        </Section>
      )}

      {answer.relatedTopics?.length > 0 && (
        <Section icon={Sparkles} title="Explore related concepts">
          <div className="related-topics">
            {answer.relatedTopics.map((topic, i) => <span key={i}>{topic}</span>)}
          </div>
        </Section>
      )}

      {answer.youtubeQuery && (
        <Section icon={Youtube} title="Continue learning">
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(answer.youtubeQuery)}`}
            target="_blank"
            rel="noreferrer"
            className="mentor-youtube"
          >
            Find lessons on YouTube
          </a>
        </Section>
      )}

      {!hasNewMentorContent && !answer.body && (
        <p className="muted">No explanation content is available.</p>
      )}
    </div>
  )
}
