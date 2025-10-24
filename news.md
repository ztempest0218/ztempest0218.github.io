---
title: News
permalink: /news/
layout: page
---

{% assign items = site.news | sort: 'date' | reverse %}

<div class="news-list">
  {% for n in items %}
    {% include news_card.html item=n %}
  {% endfor %}
</div>
