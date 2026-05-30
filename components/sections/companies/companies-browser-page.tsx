                      {data.companyName}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                      {truncateText(data.summary, 220)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/companies/${companyId}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-outline-variant bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                  >
                    Open page
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-8 p-6 md:p-8">
                <section>
                  <h3 className="text-2xl tracking-tight text-on-surface">
                    About the company
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                    {truncateText(data.summary, 260)}
                  </p>
                </section>

                <section>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Active job openings
                      </p>
                      <h3 className="mt-2 text-3xl tracking-tight text-on-surface">
                        Current roles
                      </h3>
                    </div>
                    <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      {data.jobs.length} positions
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {data.jobs.map((job) => (
                      <article
                        key={job.id}
                        className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-on-surface">
                              {job.title}
                            </h4>
                            <p className="mt-1 text-sm text-on-surface-variant">
                              {job.location} · {job.requiredQualification}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                            {job.applicationsCount} applicants
                          </span>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-on-surface-variant">
                          {truncateText(job.description, 180)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] text-on-surface-variant"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
                          <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                            Top match score {job.topMatchScore.toFixed(0)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => applyMutation.mutate(job.id)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            Apply now
                            <MaterialSymbol
                              icon="send"
                              className="text-[14px]"
                            />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4 border-t border-outline-variant bg-surface p-6 md:p-8 lg:border-l lg:border-t-0">
                <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Benefits
                  </p>
                  <div className="mt-5 space-y-4">
                    <Benefit
                      label="Remote flexibility"
                      copy="Blend office and remote work to match the hiring style."
                    />
                    <Benefit
                      label="Talent growth"
                      copy="Strong teams, clear progression, and visible career movement."
                    />
                    <Benefit
                      label="Practical support"
                      copy="Hiring teams that value direct communication and quick decisions."
                    />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Quick facts
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-on-surface-variant">
                    <Fact label="Industry" value={data.industry} />
                    <Fact label="Location" value={data.location} />
                    <Fact label="Open roles" value={String(data.jobs.length)} />
                    <Fact label="Focus" value={data.teamFocus} />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Actions
                  </p>
                  <div className="mt-4 space-y-3">
                    <Link
                      href={`/companies/${companyId}`}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      View company page
                    </Link>
                    <Link
                      href="/jobs"
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                    >
                      Explore jobs
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Benefit({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <MaterialSymbol icon="star" className="text-[16px]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="mt-1 text-xs leading-6 text-on-surface-variant">{copy}</p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm text-on-surface">{value}</p>
    </div>
  );
}
