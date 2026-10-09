import { Link } from 'react-router-dom'
import { HelpCircle, MessageCircleQuestion } from 'lucide-react'
import { FAQS } from '../utils/constants'

export default function FaqPage() {
  return (
    <div className="container-page py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
        <HelpCircle className="h-6 w-6 text-brand-600" />
        Frequently asked questions
      </h1>
      <p className="muted mt-1">
        Answers describe how this Fixora implementation actually behaves — including the parts that are deliberately
        limited.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {FAQS.map((faq) => (
          <details key={faq.question} className="card p-5">
            <summary className="cursor-pointer text-sm font-semibold text-ink-900">{faq.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{faq.answer}</p>
          </details>
        ))}
      </div>

      <div className="card mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <MessageCircleQuestion className="mt-0.5 h-5 w-5 text-brand-600" />
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Still stuck?</h2>
            <p className="muted mt-1">
              Ask the AI assistant in plain English, or raise a complaint and an administrator will pick it up.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/assistant" className="btn-secondary btn-sm">
            Ask the assistant
          </Link>
          <Link to="/support" className="btn-primary btn-sm">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
