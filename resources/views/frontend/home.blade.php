@extends('layouts.app')

@section('title', 'Tamish Pratap Singh | Laravel & PHP Developer | AI Prompt Engineer')

@section('content')

  <section id="hero" class="hero-section" data-hero>
    <div class="hero__copy-back" data-hero-copy-back>
      <h1 class="hero__title" data-hero-title aria-label="{{ implode(' ', $profile['hero_lines']) }}">
        @foreach($profile['hero_lines'] as $line)
          <span class="hero__line-mask">
            <span class="hero__line" data-hero-line>{{ $line }}</span>
          </span>
        @endforeach
      </h1>
    </div>

    <div class="hero__ui-front">
      <div class="hero__statement" data-hero-statement>
        <span class="hero__eyebrow">{{ strtoupper($profile['intro']) }}</span>
        <p>{{ $profile['hero_description'] }}</p>
        <p>{{ $profile['hero_support'] }}</p>
        <p class="hero__closing">{{ $profile['hero_closing'] }}</p>

        <div class="hero__actions" aria-label="Primary actions">
          <a href="#work" class="button-link button-link--primary" data-cursor-state="interactive">
            View My Work
          </a>
          <a href="#about" class="button-link button-link--secondary" data-cursor-state="interactive">
            More About Me
          </a>
        </div>
      </div>

      <p class="hero__availability text-micro">
        {{ $profile['availability'] }}
      </p>

      <a href="#home-overview" class="hero__scroll" data-hero-scroll>
        Explore
      </a>
    </div>
  </section>

  <section id="home-overview" class="home-overview-section page-section" aria-labelledby="home-overview-heading">
    <div class="home-overview__inner">
      <div class="section-heading">
        <span class="text-micro">01 / Home</span>
        <p class="section-heading__copy text-small">
          {{ $profile['personal_statement'] }}
        </p>
      </div>

      <div class="highlight-grid" aria-label="Portfolio focus areas">
        @foreach($highlightCards as $card)
          <article class="highlight-card">
            <span class="highlight-card__rule" aria-hidden="true"></span>
            <h2 id="{{ $loop->first ? 'home-overview-heading' : '' }}" class="highlight-card__title">
              {{ $card['title'] }}
            </h2>
            <p class="text-small">{{ $card['description'] }}</p>
          </article>
        @endforeach
      </div>

      <p class="home-overview__closing">
        I don't just want to make websites. I want to build things people remember using.
      </p>
    </div>
  </section>

  <section id="about" class="about-section" data-about data-about-section>
    <div
      class="about__track"
      data-about-track
      style="--about-track-height: {{ 225 + (count($about['statement']) * 20) }}svh; --about-line-count: {{ count($about['statement']) }}"
    >
      <div class="about__stage" data-about-stage>
        <span class="about__index" data-about-index aria-hidden="true">{{ $about['index'] }}</span>

        <div class="about__intro" data-about-intro>
          <span class="about__label text-micro" data-about-label>{{ $about['label'] }}</span>
        </div>

        <div class="about__statement-layer" data-about-statement-layer>
          <h2 class="about__statement" data-about-statement aria-label="Builder. Problem Solver. Always Curious.">
            @foreach($about['statement'] as $line)
              <span class="about__line-mask">
                <span class="about__line" data-about-line>
                  @foreach($line as $part)
                    @php
                      $partClass = !empty($part['mobileBreak']) ? ' about__mobile-break' : '';
                    @endphp

                    @if(!empty($part['emphasis']))
                      <span class="about__emphasis{{ $partClass }}" data-about-emphasis>{{ $part['text'] }}</span>
                    @else
                      <span class="{{ trim('about__text-part' . $partClass) }}">{{ $part['text'] }}</span>
                    @endif
                  @endforeach
                </span>
              </span>
            @endforeach
          </h2>
        </div>

        <div class="about__details" data-about-details>
          <p class="about__body text-small" data-about-copy>
            {{ $about['body'] }}
          </p>

          <dl class="about__meta" data-about-meta>
            <div class="about__meta-row" data-about-meta-row>
              <dt>Focus</dt>
              <dd>Web / AI / Interaction</dd>
            </div>
            <div class="about__meta-row" data-about-meta-row>
              <dt>Mode</dt>
              <dd>Technical and creative</dd>
            </div>
            <div class="about__meta-row" data-about-meta-row>
              <dt>Current</dt>
              <dd>Laravel / GSAP / Three.js</dd>
            </div>
            <div class="about__meta-row" data-about-meta-row>
              <dt>Available</dt>
              <dd>Selected projects</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <section class="about-detail-section page-section" aria-labelledby="about-detail-heading">
    <div class="about-detail__inner">
      <div class="section-heading">
        <span class="text-micro">How I Think</span>
        <div class="section-heading__copy about-detail__intro">
          <h2 id="about-detail-heading">Development is problem solving with a human on the other side.</h2>
          @foreach($about['main_content'] as $paragraph)
            <p class="text-small">{{ $paragraph }}</p>
          @endforeach
        </div>
      </div>

      <div class="about-detail__grid">
        <article class="about-detail__philosophy">
          <span class="text-micro">{{ $about['philosophy']['heading'] }}</span>
          <p class="text-body">I like asking questions.</p>

          <ul class="question-list" aria-label="Questions that guide my work">
            @foreach($about['philosophy']['questions'] as $question)
              <li>{{ $question }}</li>
            @endforeach
          </ul>

          <p class="text-small">{{ $about['philosophy']['closing'] }}</p>
        </article>

        <div class="value-grid" aria-label="What I care about">
          @foreach($about['values'] as $value)
            <article class="value-card">
              <span class="text-micro">{{ $value['number'] }}</span>
              <h3>{{ $value['title'] }}</h3>
              <p>{{ $value['description'] }}</p>
            </article>
          @endforeach
        </div>
      </div>

      <div class="current-focus">
        <span class="text-micro">Current Focus</span>
        <p>{{ $about['current_focus'] }}</p>
      </div>

      <p class="about-detail__closing">
        {{ implode(' ', $about['closing']) }}
      </p>
    </div>
  </section>

  @php
    $capabilityCount = $capabilities->count();
  @endphp

  <section id="services-intro" class="services-intro-section page-section" aria-labelledby="services-intro-heading">
    <div class="services-intro__inner">
      <div class="section-heading">
        <span class="text-micro">03 / What I Do</span>
        <div class="section-heading__copy">
          <h2 id="services-intro-heading">Ideas into working products.</h2>
          <p class="text-small">
            I work across web development, backend systems, AI integrations, and interactive frontend experiences.
          </p>
          <p class="text-small">
            The goal is simple: build products that look good, work reliably, and provide real value.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section
    id="services"
    class="capabilities-section{{ $capabilityCount === 0 ? ' capabilities-section--empty page-section' : '' }}"
    data-capabilities
    data-capabilities-section
  >
    @if($capabilityCount)
      <div
        class="capabilities__track"
        data-capabilities-track
        style="--capability-count: {{ max($capabilityCount, 1) }}"
      >
        <div class="capabilities__stage" data-capabilities-stage>
          <div class="capabilities__chrome" data-capabilities-chrome>
            <span class="capabilities__label text-micro" data-capabilities-label>Services / Expertise</span>

            <span class="capabilities__counter text-micro" aria-label="Current service">
              <span data-capabilities-current>01</span>
              <span aria-hidden="true">/</span>
              <span>{{ sprintf('%02d', $capabilityCount) }}</span>
            </span>
          </div>

          <div class="capabilities__progress" aria-hidden="true">
            <span data-capabilities-progress></span>
          </div>

          <div class="capabilities__rule capabilities__rule--top" aria-hidden="true">
            <span data-capabilities-divider-x></span>
          </div>

          <div class="capabilities__rule capabilities__rule--bottom" aria-hidden="true">
            <span data-capabilities-divider-x></span>
          </div>

          <div class="capabilities__rule capabilities__rule--vertical" aria-hidden="true">
            <span data-capabilities-divider-y></span>
          </div>

          <div class="capabilities__number-layers" data-capability-number-layers aria-hidden="true">
            @foreach($capabilities as $index => $capability)
              @php
                $displayNumber = sprintf('%02d', $index + 1);
              @endphp

              <div
                class="capability-number-mask"
                data-capability-number-layer
                data-capability-index="{{ $index }}"
              >
                <span data-capability-number>{{ $displayNumber }}</span>
              </div>
            @endforeach
          </div>

          <div class="capabilities__content-layers" data-capability-content-layers>
            @foreach($capabilities as $index => $capability)
              @php
                $displayNumber = sprintf('%02d', $index + 1);
                $rawNumber = $capability->number ?? $displayNumber;
                $capabilityTitle = trim($capability->title ?? 'Untitled Service');
                $capabilityDescription = trim(strip_tags($capability->description ?? ''));
                $titleWords = preg_split('/\s+/', $capabilityTitle, -1, PREG_SPLIT_NO_EMPTY);
                $splitAt = count($titleWords) > 2 ? (int) ceil(count($titleWords) / 2) : count($titleWords);
                $titleLines = count($titleWords) > 2
                  ? [
                      implode(' ', array_slice($titleWords, 0, $splitAt)),
                      implode(' ', array_slice($titleWords, $splitAt)),
                    ]
                  : [$capabilityTitle];
                $focusAreas = collect($capability->focus_areas ?? []);
                $derivedMeta = collect($titleWords)
                  ->map(fn ($word) => strtoupper(preg_replace('/[^A-Za-z0-9]+/', '', $word)))
                  ->filter()
                  ->take(4);
                $capabilityMeta = $focusAreas->isNotEmpty()
                  ? $focusAreas->take(8)->implode(' / ')
                  : $derivedMeta->implode(' / ');
              @endphp

              <article
                class="capability-chapter{{ $index === 0 ? ' is-active' : '' }}"
                data-capability
                data-capability-item
                data-capability-index="{{ $index }}"
                data-capability-number="{{ $rawNumber }}"
                data-capability-sort-order="{{ $capability->sort_order ?? $index }}"
                aria-hidden="{{ $index === 0 ? 'false' : 'true' }}"
              >
                <span class="capability-chapter__index text-micro" aria-hidden="true">{{ $displayNumber }}</span>

                <div class="capability-chapter__title-wrap">
                  <h3 class="capability-chapter__title" data-capability-title>
                    @foreach($titleLines as $line)
                      @if(filled($line))
                        <span class="capability-title-mask">
                          <span data-capability-title-line>{{ $line }}</span>
                        </span>
                      @endif
                    @endforeach
                  </h3>
                </div>

                <div class="capability-chapter__details" data-capability-details>
                  @if(filled($capabilityDescription))
                    <p class="capability-chapter__description text-small" data-capability-description>
                      {{ $capabilityDescription }}
                    </p>
                  @endif

                  @if(filled($capabilityMeta))
                    <p class="capability-chapter__meta text-micro" data-capability-meta>
                      {{ strtoupper($capabilityMeta) }}
                    </p>
                  @endif
                </div>
              </article>
            @endforeach
          </div>
        </div>
      </div>
    @else
      <p class="empty-state text-small" data-empty-state>
        Services will appear here when records are available.
      </p>
    @endif
  </section>

  <section class="process-section page-section" aria-labelledby="process-heading">
    <div class="process__inner">
      <div class="section-heading">
        <span class="text-micro">How I Build</span>
        <div class="section-heading__copy">
          <h2 id="process-heading">Clean enough to understand. Flexible enough to scale. Interesting enough to remember.</h2>
        </div>
      </div>

      <div class="process-grid" aria-label="Build process">
        @foreach($processSteps as $step)
          <article class="process-step">
            <span class="text-micro">{{ $step['number'] }}</span>
            <h3>{{ $step['title'] }}</h3>
            <p>{{ $step['description'] }}</p>
          </article>
        @endforeach
      </div>
    </div>
  </section>

  <section id="work" class="work-section" data-work data-project-section>
    <div class="work__intro" data-work-intro>
      <span class="work__intro-label text-micro" data-work-intro-item>04 / Selected Work</span>
      <p class="work__intro-copy text-small" data-work-intro-item>
        Some projects begin with a client requirement. Others begin with a question: can I build this?
        Either way, I like turning the idea into something real.
      </p>
    </div>

    @if($projects->count())
      <div class="work__track" data-work-track style="--work-project-count: {{ max($projects->count(), 1) }}">
        <div class="work__stage" data-work-stage>
          <div class="work__stage-meta" data-work-stage-meta>
            <div class="work__counter text-micro" aria-label="Current project">
              <span data-work-current>01</span>
              <span aria-hidden="true">/</span>
              <span data-work-total>{{ sprintf('%02d', $projects->count()) }}</span>
            </div>

            <div class="work__progress" aria-hidden="true">
              <span data-work-progress></span>
            </div>
          </div>

          <div class="work__project-layers" data-work-project-layers>
            @foreach($projects as $index => $project)
              @php
                $projectTitle = $project->title ?? 'Untitled Project';
                $projectCategory = $project->category ?? 'Digital Experience';
                $projectYear = $project->year ?? '2026';
                $projectTech = $project->technologies ?? 'Laravel / Three.js / GSAP';
                $projectDescription = $project->short_description ?? $projectTech;
                $projectImage = $project->image_url ?? '';
                $projectSlug = $project->slug ?? 'project-' . $index;
                $projectCta = $project->cta ?? 'View Project';
              @endphp

              <article
                class="work-project{{ $index === 0 ? ' is-active' : '' }}"
                data-work-project
                data-project-item
                data-project-index="{{ $index }}"
                data-project="{{ $projectSlug }}"
                data-project-title="{{ $projectTitle }}"
                data-project-category="{{ $projectCategory }}"
                data-project-year="{{ $projectYear }}"
                data-project-tech="{{ $projectTech }}"
                data-project-description="{{ \Illuminate\Support\Str::limit($projectDescription, 128) }}"
                data-project-image="{{ $projectImage }}"
                data-img="{{ $projectImage }}"
              >
                <div class="work-project__title-mask">
                  <h2 class="work-project__title" data-work-project-title>
                    <span data-work-project-title-line>{{ $projectTitle }}</span>
                  </h2>
                </div>

                <div class="work-project__details" data-work-project-details>
                  <p class="work-project__description text-small">
                    {{ \Illuminate\Support\Str::limit($projectDescription, 170) }}
                  </p>

                  <div class="work-project__meta text-micro">
                    <span>{{ $projectCategory }}</span>
                    <span>{{ $projectYear }}</span>
                    <span>{{ $projectTech }}</span>
                  </div>

                  <a
                    href="#contact"
                    class="work-project__link text-micro"
                    data-project-link
                    data-cursor-state="project"
                    aria-label="{{ $projectCta }}: {{ $projectTitle }}"
                    tabindex="{{ $index === 0 ? '0' : '-1' }}"
                  >
                    {{ $projectCta }}
                  </a>
                </div>
              </article>
            @endforeach
          </div>
        </div>
      </div>
    @else
      <p class="empty-state text-small" data-empty-state>
        Selected work will appear here when project records are available.
      </p>
    @endif
  </section>

  <section id="experiments" class="journal-section" data-journal data-journal-section>
    <div class="journal__inner">
      <header class="journal__header" data-journal-header>
        <span class="journal__label text-micro" data-journal-label>Experimental Work</span>

        <h2 class="journal__heading" data-journal-heading aria-label="Small experiments become bigger projects.">
          <span class="journal-heading__mask">
            <span data-journal-heading-line>Small experiments</span>
          </span>
          <span class="journal-heading__mask">
            <span data-journal-heading-line>become bigger</span>
          </span>
          <span class="journal-heading__mask">
            <span data-journal-heading-line>projects.</span>
          </span>
        </h2>

        <p class="journal__copy text-micro" data-journal-copy>
          Not everything I build needs to become a large product. Small experiments often become the foundation for bigger projects.
        </p>
      </header>

      <div class="journal-list" data-journal-list>
        @foreach($experimentalNotes as $index => $note)
          @php
            $article = $articles->count() ? $articles->get($index % $articles->count()) : null;
            $image = $article->image_url ?? '';
            $displayIndex = sprintf('%02d', $index + 1);
          @endphp

          <article
            id="experiment-{{ $displayIndex }}"
            class="journal-item"
            data-journal-item
            data-journal-index="{{ $index }}"
            data-journal-image="{{ $image }}"
            data-img="{{ $image }}"
          >
            <span class="journal-item__rule" data-journal-divider aria-hidden="true"></span>

            <a
              class="journal-item__link"
              data-journal-link
              data-cursor-state="article"
              href="#contact"
              aria-label="Talk about {{ $note }}"
            >
              <span class="journal-item__index text-micro" data-journal-index-label>{{ $displayIndex }}</span>

              <span class="journal-item__body">
                <h3 class="journal-item__title" data-journal-title>{{ $note }}</h3>
                <span class="journal-item__excerpt text-small" data-journal-excerpt>
                  More experiments. More ideas. More projects coming.
                </span>
              </span>

              <span class="journal-item__meta text-micro" data-journal-meta>
                <span data-journal-category>Experiment</span>
                <span>Explore</span>
              </span>

              <span class="journal-item__arrow text-micro" aria-hidden="true">-&gt;</span>
            </a>
          </article>
        @endforeach
      </div>

      <div class="journal-preview" data-journal-preview aria-hidden="true">
        <img data-journal-preview-image alt="">
      </div>
    </div>
  </section>

  <section id="contact" class="contact-section" data-contact data-contact-section>
    <div class="contact__track" data-contact-track>
      <div class="contact__stage" data-contact-stage>
        <div class="contact__chrome" data-contact-chrome>
          <span class="contact__label text-micro" data-contact-label>{{ $contact['label'] }}</span>

          @if(filled($contact['availability']))
            <p class="contact__availability text-micro" data-contact-availability>
              <span class="contact__availability-dot" aria-hidden="true"></span>
              <span>{{ strtoupper($contact['availability']) }}</span>
            </p>
          @endif
        </div>

        <div class="contact__location" data-contact-location aria-label="{{ $contact['location'] }}">
          <div class="contact-location__mask" aria-hidden="true">
            <span class="contact-location__text" data-contact-location-text>{{ strtoupper($contact['location']) }}</span>
          </div>
        </div>

        <div class="contact__cta" data-contact-cta>
          <h2 class="contact__statement" aria-label="{{ implode(' ', $contact['cta']) }}">
            @foreach($contact['cta'] as $line)
              <span class="contact-statement__mask">
                <span data-contact-cta-line>{{ $line }}</span>
              </span>
            @endforeach
          </h2>

          <p class="contact__copy text-small">
            {{ $contact['intro'] }}
          </p>

          <p class="contact__copy text-small">
            {{ $contact['support'] }}
          </p>

          @if(filled($contact['email']))
            <a
              href="mailto:{{ $contact['email'] }}"
              class="contact__email"
              data-contact-email
              data-cursor-state="contact"
              data-magnetic
            >
              <span class="contact__email-mask">
                <span data-magnetic-inner>{{ $contact['email'] }}</span>
                <span aria-hidden="true">{{ $contact['email'] }}</span>
              </span>
            </a>
          @endif
        </div>

        <div class="contact__meta" data-contact-meta>
          <div class="contact__meta-block contact__meta-block--wide text-micro">
            <span>Open to</span>
            <span>{{ implode(' / ', $collaborationOptions) }}</span>
          </div>

          @if(filled($contact['descriptor']))
            <p class="contact__meta-block text-micro">
              <span>Work</span>
              <span>{{ strtoupper($contact['descriptor']) }}</span>
            </p>
          @endif

          @if(filled($contact['timezone']))
            <p class="contact__meta-block text-micro">
              <span>Timezone</span>
              <span>{{ $contact['timezone'] }}</span>
            </p>
          @endif

          <form class="contact-form" action="mailto:{{ $contact['email'] }}" method="post" enctype="text/plain">
            <label class="contact-form__field">
              <span class="text-micro">Name</span>
              <input type="text" name="name" placeholder="Your name" autocomplete="name" required>
            </label>

            <label class="contact-form__field">
              <span class="text-micro">Email</span>
              <input type="email" name="email" placeholder="Your email address" autocomplete="email" required>
            </label>

            <label class="contact-form__field contact-form__field--wide">
              <span class="text-micro">Project / Subject</span>
              <input type="text" name="subject" placeholder="What are you working on?" required>
            </label>

            <label class="contact-form__field contact-form__field--wide">
              <span class="text-micro">Message</span>
              <textarea name="message" rows="4" placeholder="Tell me a little about your idea, project, or problem." required></textarea>
            </label>

            <button class="contact-form__button" type="submit" data-cursor-state="contact" data-magnetic>
              <span data-magnetic-inner>Send Message</span>
            </button>
          </form>

          <p class="contact__meta-block contact__meta-block--wide text-micro">
            <span>Online</span>
            <span>LinkedIn / GitHub / Instagram / Email</span>
          </p>

          <nav class="contact__socials" data-contact-social aria-label="Social profiles">
            <span class="contact__socials-label text-micro">Social</span>

            @foreach($contact['socials'] as $social)
              @php
                $socialUrl = $social['url'];
                $isExternalSocial = \Illuminate\Support\Str::startsWith($socialUrl, ['http://', 'https://']);
              @endphp

              <a
                href="{{ $socialUrl }}"
                class="contact__social-link text-micro"
                data-contact-social-link
                data-cursor-state="contact"
                @if($isExternalSocial) target="_blank" rel="noopener noreferrer" @endif
              >
                <span>{{ strtoupper($social['label']) }}</span>
                <span aria-hidden="true">-&gt;</span>
              </a>
            @endforeach
          </nav>

          <p class="contact__final text-small">
            {{ $contact['final'] }}
          </p>
        </div>
      </div>
    </div>
  </section>

@endsection
