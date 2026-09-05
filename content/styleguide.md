---
title: "Styleguide"
description: "Every token and component of the marek-ds design system, rendered with sample data."
# Published but unlisted: not in the sitemap, not in any list, not indexed.
layout: styleguide
noindex: true
build:
  list: never
sitemap:
  disable: true
---

## Media in Markdown

A Markdown image on its own line becomes a captioned figure in the prose column:

![Marek Dlugos](marek-dlugos.webp "A caption from the image title.")

The figure shortcode chooses a width; the gallery lays photos out by their aspect ratios; the callout sets an aside off from the text; the YouTube shortcode embeds a video privately.

{{< figure src="hobbies/marek-dlugos-photography.jpg" alt="Photography" caption="A wide figure." width="wide" >}}

{{< gallery caption="A justified gallery: rows fill the width by aspect ratio." >}}
hobbies/marek-dlugos-photography.jpg | Photography
hobbies/marek-dlugos-podcast.jpg | Podcast
marek-dlugos.webp | Portrait
{{< /gallery >}}

{{< gallery layout="grid" width="normal" >}}
hobbies/marek-dlugos-photography.jpg | Photography
hobbies/marek-dlugos-podcast.jpg | Podcast
marek-dlugos.webp | Portrait
{{< /gallery >}}

{{< callout >}}
A **callout** holds an aside, a note or a warning, with a [link](https://example.com) if needed.
{{< /callout >}}

{{< youtube a4MxPc0iAHU >}}
