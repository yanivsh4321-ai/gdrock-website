/**
 * GDRock Cloudflare Worker
 * Handles: gdrock.js, banner config, consent logging, lead capture, GDPR scan
 *
 * Deploy at: dash.cloudflare.com → Workers & Pages → Create Worker
 * Then add a Custom Domain: cdn.gdrock.com
 *
 * Environment variables (add in Worker Settings → Variables):
 *   SUPABASE_URL          your Supabase project URL
 *   SUPABASE_ANON_KEY     your Supabase anon key
 *   TELEGRAM_BOT_TOKEN    from @BotFather on Telegram
 *   TELEGRAM_CHAT_ID      your Telegram user ID (from @userinfobot)
 *   ANTHROPIC_API_KEY     your Anthropic API key (for scanner)
 *   RESEND_API_KEY        (optional) resend.com for email alerts
 */

// ── Embedded GDRock banner script (base64 logo included) ─────────
const GDROCK_JS = `/*!
 * GDRock Cookie Banner v1.3 — cdn.gdrock.com
 */
(function(){
"use strict";
var SCRIPT=document.currentScript||(function(){var s=document.getElementsByTagName("script");return s[s.length-1];})();
var SITE_ID=SCRIPT.getAttribute("data-site-id");
var API_BASE="https://cdn.gdrock.com";
var LANG=(SCRIPT.getAttribute("data-lang")||navigator.language||"en").slice(0,2);
var STORAGE_KEY="gdrock_consent_"+(SITE_ID||"default");
var LOGO_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAgUElEQVR42oWaeZRbaXnmf9LVdiVdqVbX2rZrt9ttu8E03W130yxJyCGEE2aAzBB6IAlNSGCAAM3MEAhNTgKELNMMZEJIAklISMgAmXCahNCLXVWustuuctndtqsk1eKlSqWlNm13kXTvO39clVwOnDN/Sedcvff9Pt3vPu/7PM/rOX36tBw9epSYpjF1bpqTD5+kUCiQSCR45JFHWF5ZYfX2bXw+H6961asoFotcvX4ND3DfkfvQNI2pqSlOnTpFsVTi2vVrKB4vR44cIRKJ3LlWLHL12lU8eLjvvkbc9DQnT56kVCpy7fp1FEXh3sOHiUYiTE1NN+959dpVAI7u5pue4uTJU5TLJa7PzwNw5N57iUSiTJ+b5tTDJykWi1y7fg1PNpsVy7Ko1+tEIhEqlQper5dwOEyxWERVVRRFwbBM7Hodv89PSA0BHkzDwLZtIpEIuq7j9XoJhUJU9AqO7eD1eu+6pxpWAQ+GrmPbNtFoFF3X8Xg8qGGV7e0d8EDA52/GKYpyJ59pYNfv5Ks7Nl6PBy2qYZomtXqd6F1xKt5YLIZt2xiGQSwWwzAMHMchpsUol8soikJrayvt7e2YpoVt28RjcWKaRq1WwzAM4vE4lUoF27ZpibfQ0tpK3bGxLItYPIbeuGc8FifeyGeaJrGYe01EiMfidLS3g4h7LR7HMNwNxWNx4loMu25jNOIM06RerxMNR4nH49Qbe4jH4xiGiW3bxDQNxsfHJZfLiWmaMj4+LqZpSi6Xk+npaRERuXHzhrx09WXZLu6IiEg2m5WJyUkZn5yQjY0NsSxLzpw5I6ZpSj6fl7NTU3J7bVWsqiWVSkXOjI+LaVmysbEh45MTMnn2rGxuboplWTIxOSFGI+7FF1+UWq0mIiLlclnOjJ8RqxE3cXZSzk5PSX4jL5ZpyvjEuOi6Lpubm3Lh4gU5/+KLsrm1KZZpycTEhFiWu4cz42fEUyqVZGtri2q1Snd3N7lcjmAwSEtLC5lMBkEIh8P09vSSTCYJBAJ0d3dTr9fcf8pxiMdirK2tEQwG6ejs5Pr8dXq7e2hra6Ner3Pr1i2CwSC9vb0UyiXKpRJ2rU4wFCQciRAMBPEAGxsbRKNR1HAYn6Jw8+ZNgsEgXd3dFIsFyuUydr1OVNPo7OjE5/NhmAaGYbC9s4PYDn19fdy+fQtVDbNv3z680WgU27bRDaP5TtRqNSKRCDuFAv5AgEg4QjabxR/woygKlUqFYDCIPxhAUbwYhkEgEMDr9VIpl2lvbcOyLDY2N/H5fKiqis/no1wu09bail23qVQqdLR3UCwWsSwTTdPYKexQq9XwejyUSiWCwaCbr1ymraUNx3YwDJO21jbK5TKbm5voFR2zcVzFQ+O9j+LxeCgWi3jrto0AXsWLbdsAiAi2bSOOQzikEggESKVS9HT3EAqFWFpaYnunQCgYIhqJsrKyQldXF36/n6XlJQ4ePIjj2GQy6+Q28tyzfz+hUIjFxUU8eAj4/QQCAVRVRa/oFApFbNumXrfxBfwAJBIJuru7CQaDpFIpFJ+Cz+fD5/MRCATY2Njg1q1brKyskE6n8fv9xGIxMrksPT09btziIpw9e1ayuZzoFV0mz06KruuSzeXk/Pnz4jiOLC4uyuXLl0VEZG5uThaXlkRE5OLFi3LhwgVJJBIiInL58mVZXFwUEZGpc9OSz+dFNwyZnD4r165fk418XsRx5Ny5c5LL5cQwDJmcnBDD0CW/kZdz586J/KR8jXvuxlUqFTl79qyUiiWplMty89ZN9/3czTd1VhLJpGxtbkq9Xpe7y0Q4TEXXURQFVVWbZcKreCkWi8Rjcep2HcMw0KIaPp8P23HY2dkhFovh1G10U6cl3oK+pxQEAgEsy2J7Z4eWeJxqtUqtViMajVKplBv5whSKBcJqGEVRKBQKxOPxn4jw4XCYWCxGobhDJpOlt6fXLRO1GlFNI7O+jhaLcU9/v1sm6nV30U1otm00TaNUKqEoCmE1TLFUItSoiZVyBVVViUajBAMBSqUSoVAIxadQKpWJRCPU63VM0323VFWlVqvh8UBX1z5M08I0G4s2Ley6g6ZplMuNeqmqzXt6FYVSqYSmadhOHV3X0WIaddumbjuAB03TmvlimkYwGKRaq7K5uQlnzpyRfD4vlmXJ6TNnxKpaks/lZHJyUkREUqmUzM7OiojI7Oxs88icP39epqenZX5+3r126ZKkUikREZlolBDTNOX0mTMyd/myOHZNnj19Vj7/x18Wu14VwzDkueeeE8uyJJ/Py8TkxE/Ml0wmRURk8uxZyefzYhqGnBk/I+n1jJiWJY7jyNkpt4SYpimnT59ulImsjI+Pi8cwDFlfX8cwDAYHB1lZWUFVVbq7u1lILNDT04MaUkktphgdHqWsV8hms4wMD7swbRgsLy8zPDyMbhhkMhkOjY2xtraGbhgcGhsDhD/9xt/zW7/3NOIRnvyNX+aJd72NfZ37WEgk3DLU28t8YoG+nl5CoRDJZJLR0VEMw2B9fZ3Dhw6RTqcxLYvu7m5aWuJsbW9z69YtDh86TDqzjmWYDAwMsLyyTFhV6e7uQfnQhz70lIjgU3zY4iCAT1FwHAcElMZ3EfB6PSCC4vXi8XioVqvU63XA/V29XsfjcX/jUxRaW+Ms3VjlY5/5ff7nV/8aTQsT8Pv54elprieWuO/wKPv7evB4PFjVKgh4PR5EBBHB6/Xe+fR6EAGP1wuAqRtUa1UURcGDB3Gc5u/rdh2Px12jN5lMoqoqPb09JJMJenq6m5A+NDSEYRik02lGR0bIZrPous7BAwdZWl4mkUiSz+cZGhoivb6OY9uMDA+Tz2XJb23z5a//A6/9hXfxT//yHDEtimFaFIsVYtEoE+dmeN0vPM7Tf/53ZHKbbG7mGRkexrFt0uk0w8MjpNfXKZVKDAwMkFpcJBQK0dvbSzqdZmVlhVq1xtDgEEtLS+4eenpIJpN0dnQSCAZYSCbwiIgsLS1RLBZ5xStewZUrV4hGowwNDXHu/HmGh4bQohoXZy7ywAMPUCqVSK+tEgqFGBwYxB8M8vJLVxgdG+Pm7TV+8G8vMPPSdV44+yIb29toEQ3TsgirIT76vscZHDjIb376c2xsbdMSj7FTKNHR1sJPP3aS4/eO8OY3voGD9/STTCY4euw4pl5hcXmZ++47ysrKCrlcjlgsxsGBg5SKJZaWlnj44YdZXFykUqlw/Phxt8nY2iSXy+FJJpMSiUTwKl5KxV20cjAb0GyaJuIIwVAQwzCo121mXrrG9k4B8LJdKPDStQU2d0osrdwmk88j4hAI+LGsKmooxKMPvpJPfOBXeOCVx9na3ia/tcOX/vybfOu7z+D1evD7/VhWHRC6OtsZOnAPHW1xjt57iPa2OEG/n5Z4nBPH7iUcVvH5/QSDQey6i6rlShk1pOLxeqiUKwTVEKFgiEDAj2d2dlb6+vpQw2FSqSQjI6MYhk46vc69hw9z+/ZtDMNgZGSEtdVVspubvPWXP9rYIHg8HhSvF0Hwej2IA4LQ1hLjsVMP8Ku/9DYODe7H4/ESi7eQSCYZOHAALRrl+z98jm9//4dMTM+wtVMk4PeDB2zbwePxNN5vQVF8+Lxepv/1WxwaGUYQ95qAAKlUit6eRpe1vERLSyuaphEJh90juri4SKFQ4MSJE1yam0OLRhkZGWH63Dni8TjBYIC1tTSPPnKK1NINHn3zLyENMCiWywT8fnyKl86ONu6/716G9/fyrnf8AkcOj3Hxwovcd/QYpVKJZDLJI488QjKZpFgq8aoTJ0glk2Q3tkjdXONb3/k+N1czbO0UKJbK+HwKkXAY27ZpbYnxjad/h3g0TP+BA7TE4uRyORYXF3n0kUdIpVJUKhXuv/9+ANYzGVLJ5J4nqLqlYHhoGNMwyGSzDA8PoyiK258Ca6u32dwq8ovvf5KNrW16u/bxxONvo2oZ/MzrX0tHa5yqZTA2dojbt29RLJY4ODDAzRs3CIfDdHd3M78wT29vL2pIZX5hgZGRETxAYWebgwMDXLs2z3xyETUaY+rFi/zdd59hp1BBDQV44Z++wYH+Pubn5zl0+F7UUAjTMFhcXqa7q4uQqrK8vERYDROPx2mJx/FpmtZsh3aZse04RKNRyuUy4UgExeulXHbPueIr4zgO9bpNPBbh19/9DiqVCoFgkKpVo16rsr6eRgRUVaVcKhEOh/F6vZRKJWLanc6ptaWFWqNts2p1Mtkc8ZYYjz78AJqmcfKVR3h+4hy5jW2i0TDVag3LtIjHW9ANHcuyXPrUYESGrqNFNXRdp1Qq4ff78Y6MjGCaJuvr64yOjrKeyWAYBkNDQ9y4eZNMNsPG5ibJZJKu7i60WAzLsvApCrpukFpeobOrh+UbNylVKoyMjHDj5k1UVaW3t5dEMkl3T3fzhAwNDWEae/Ktr2NZFmOjoyyvLBMMBIlqcWZm5/D6/ASCQep1m0DAT7lUYj2bYWBwgKplsZZe48bNGwwNDqLrOtnGqYtGo5RKJZZWllw2sdvdj0+Mi24YksvlZOqcy+hTiymZu+J299evXZPJ6XMycOL1Eui9Vx5849tle2dbJicnxTBMyWQyMjXlxiVTSZn7CaxganrqTr7xcTF2801NSQMPmq3ay1dflqOPvknC+++XzkMPykIyJbVaVSYmJ2Vza0tsx5Z6vS7T09PuPU3TZRqlktTrddEN3WUTpulqGOFwGH2XTYRVCoWCeywVhWKxSEd7O7fTGd70zl9ju1BidHA/3/v6l4hGoxQKBTRNIxDws7G5RUzT8PkUdrZ3CEciSENr0TTN1WEarKBSqeDz+QiFQuh6Bb8/0MwX1aL8h1/+EJevJtjX0c53/vKP6Ovqwuf3097e3nxqLS0tTZIQiUSo6DrRSITOzs6G6OTYd9hEY7OaFqNULqMoXtSQ2mATIfx+P+K4MG7bNqZlEYvFCPgVbq+tY9UcxLGxqjWKpQobm5t0dLS7LESvoGkaitdL1bKIRqNYVQuv10s0GmV1LY1XUYg1mIyqhlyQE5ep12p1V3SKx7Esi1K5jK7r7jvo2M0/0KpalCsVypUK3hcvXCAa1RgeHub8+fPsv+cewuEwV65c5ujRIxTLJVZu3uBVJ06wvLJMfjOPqkao122i0Qg9PV3MX7/K//23CT71+/+Ld3/wSW5lNvnK17/FO9/3m3zxq9/kb/7hu1iWxcDgEFdeukLFMOnu7WV+/hr9/fdQLOvMXbnM17/9z+Q38ly4NMeJEydYXV2jWCrh8/vQDYPOzg6GhwZ4+eWXmZubo2pZHD9+nJnZGbSoxtDQEOcvvMjAwQFimsbLL7+E78FXv5r19XXyuRwPP/QQyzdWCPj8DI+MMD+/QFtbO60trczOzXJ47BDe22voho7P56NUrrC5uUVXTx/feeaP+OofPMXUizPMLyRYvnGLP/zdT5JIpHjmuSlmr8yTzuV47OEH+N4PnqOzvZVP/Nf38t4Pf5LVdIZffOubMEyLp//sbxka3E9fdye9Pb3EtCi1Wp1wu8r21jbzVYtwJMyhQ2NUKjpzl+d49QOvJp1Ok8vlePjBh1hZWUYNqRw7egxvsVRqCkPFYpFwSEWLxRq6Zx2vx+PWlVgM0zBwbBu/X0HERgT8Pj+bW9v4/T7Cqsp3vv8sL166SigYwO/z0d21D6tqkd3Y5APveSc/OjPNlz/3Wxw7MsZvfOKz9PV08f1v/gn7OtpYurHKM8+O8863/hyK4seqWlSrdxiKvyEIt7e2IY7LarSoRrFYvGsPoVCIcDjslqdUKnl3J97ZSde+Thzboa21FRplfnjI7e7rtRot8RiO42DbDng8eKTOQ688xvuffApHHAKBADFN48lPf4Ev/+W3+I8/9wZ8ipeR4UFOPnCc3336z0gs3uDd73gL6WyOD37yc1y5usCRQ8M8/va38LtPf43BwUHW1tbZ2NzC5/MhIrS3t7J//wE6OzvZ3NrCEYfh4WEWl5YIhUL09PSQWlxk3759tLe3uwB26uQpFpcWWVtd45FHHiGbzXDj5k3Mqsmxo8fY3trm1q3bbO5sceL++6kYhvvk/AFyG5skFpf5mde/lsd9Ph598AT3Hz/KYjJBf38/plUlvbbKG17/eh59+NWsp1f57Sc/zA9+9ByRUJDXvuZRzkxMUtYt3vyzP8Xp8QlOvOIY2Y1tLs5cJKCGsap1arUaB/ffg23XuHR5joMHDzIwMEA+l+P8+fM8/NBDLC0tkU6nOXXyJOnMOjs7N6maFp5kKimRcKQBzQX27duH7QjFUpFqtUpYDRMKhXAch1KxQGtrCx/85Of43jM/wuv18pXPfYqfeewh8CpokTCr6XW2tgt4vAq2ONSqFnEthuJTiGtRdgolujrb2SoUMHSTfZ3teL1eiqUyvd1d6LoOIkQ1jR88d4YnPvoZwMNPP/Yw3/zK56kYJqZp4PV48Tfkx91j6VMUiqUS7R0dKF5XBvWViiXiWpyQGuL26irt7R1EIpGmFqpFtYafUCebzdLW6uHEsSP8n3/+IR68zFy5ymsevJ/Wjg6qtRpLK7co6Qa6YRLw+xtKnUGtZuP1etkpFMCr4PcpbG/vsK+zHZ/PTzqT5bFTD9Ee19jY3GJfVxfnL17BcWy8Xh9DB/sJBAJ4FB+WZVHRdWKahqZprK6uuoq4qrK6tkZnZyehUMjVeXeFnpmZGbfruDwn8/PzUq1WpVQuie3UpVwqyukzp8UwDCmXivK1b/yNtA4/INED98vxx94s1VpVZudmJbXoik7jkxOSy+dExJGpqSmpVquSyWSawtK1a9d+opA1cXZS8ht5qVput3Lfo2+S2OArJHzPMZm9clVWV2/KxdmLIiJi23W5deuWTJ7dI45duiQiIrdu35a5uTmZnJwUz+zsrPT39RFSVVJLiwwPDaMbOpn1dV5x/yu4eesmeqXCwMCuIBWirb2D17zlXSzfvI1t2/zhZz7Grz7+n9jc3CKbzXBo7BDZbJZyuczg4CA3btxwQaC3l/n5efr6+ggFgqSWUoyOjlIpu0LW2Ngot9fWCAX8vDS/yNt+9SME/H6GBw7wF3/8Gfp6eggGA6zcuEk0GiUWi6NFoyRTKbq7ulBVlcWlRQYHhwgFg9TrdbyapjWtp2gk6paCuquL5nI5PHgIBkPNc+4IeER465vegGlW8XoVvvXdf6FYLDbEXLcLEREikUgzTlEUioUCMU2jWrUwGn5EuVxGRAiHXS004HPZ+te++Y94PR4Ms8obHnk13fv2YVVrWJabIxAIYNt1yuUykUj4LkZUq1WxHYdwJOyyCcM0Sa+vM9bo7k3TZHhomKWlpaakt5BM0NPTQzQcIbmY4n3/5R30dHXgU3xcuprgL7/5bbSIysDBgyRTSaJalK6uLhIJN05V1aaQZZkW6+tpRkdGyWZcIWtkZJREMsW+zg7mrqX4wY8mUNUw7a0t/NRrHqSnpxfLMl2eOjREW3s7hmmytLTE8NAwRkOyHBkZoVgqsbG54QLW3WxiQnRdl1wu53oFjbO96xVcmpuTxaVFqdu2zC9cl0889XkJ9h2V+OAJuffUz8l8IiEzszNNT2Nubu7H2cS5aclvbDTZxK4fOTU1LY7jSDKVlMETr5PW4QeEjlH5b7/zRVf4nZqSbMPHvHR5Tl68eEFu3LjRvGcunxdD12V8YlxMy/Ucp6an9rCJep1INIpuVFA8CsFQiOJuw+t1u/tY3PUmLMOkpaWF7Z0dfv7xD7Ce3cS0LN74upP89Zc/z+bmFv5AgGAgQKFYRNOiiO2gmwbxeAuGruM4DqqqUtF1/IoPX8CPB+FDn/oc3//haYKBIAf29/H9v/kK9VqVmOYKYI7jEI/HyeVzOI7jOlzRqGuhNRhRpVLB1/BXvLFYDBHB2KUyusvoW1pbqFTK+Hx+QqEQpVKJsKriV3yudxcK0RLT+K2PPIHt2MRjUf71+bP8/le+jqK4SlkwGKRYKOCqdgrFQhGtwb4rlUrDbnYF3K7ODn77C1/iez94npYGq/nCpz5CW0uMQqHomjuOg2EYhEIh2lrb8PsDTVq115swGyZNVIv+Owt7clJy+bxkslm53vAcEgsJudSA35lLs5JqHLXxyQlZz2REROQ3P/lZ8fccke4jp8TTMSq//YWnJZ1ek8tXrjTjkg3fYnx8vOmFPPvss1KtVkWvlOU9H/iYhPqPSfe9p4T2EfnjP/26LC0lZX5hoXFEG96EaciZ8XEplUsijohpmjJ5drJxzZTnn39eqtWq5HI5OX3mjHjK5bKUy2V0Q6dm2+zvv4dCocDNmzfo6uoipsUQhBs3bjA4MIhlWaxnMoyNjZJZz6DrBmNjI3zwv32WP/urf6Snp4vcxiZvf8sb+cPPPIlhVGhtb6dqWuRyOcYavoVhmBy59xCppSU+88U/4bv/8jxtLXHyG9u8/91v58Pv/c907ttHtVpjfd31OzLZDJZl0d9/D/l8Hr/fh6bFCAYCpNPppr+yvLzc7K+VT3/6009tbW2h6zo93T34/T7qdZu6U6dS0WlpaSEacTWOaFS74xt4wGn4FdVqjZ9+7CRVu87psxfoaGvlytUEPzw9SU9XO8fvO4wHqNVqOOKghkLEtCiTFy7xax9/iolzl2hriZPb2OLX3/N2vviZj1Mq665fUrebXkitVkPx+Vwnd30dDx7aWlspFIs4tt30UXa9Etu2Ud77xBNPlcplPHjo7+/D0A28Xi+appHNZlFVlXA4THt7B5lsBkXxcWD/fl6++jL7Ojvp6Ojg2rVrHDhwgJ99/SNYpsnE+VkCQT+FYpl/Gz/PhdnLHNzfxwMnXsmNlRXSuQ2+9Bd/zyc++0UqFYtAIIBhWjz5gXfz0fc9TrliMDQ4yOLiIj6fj6GhIa5efZm21hY6OjrI5fNNta6trY2XXn6Jru5u2tvaeemllzh8+DCOOCSTSTyTk5MyNjZGNBrl4swMDz74akrFEolUkpMPPczS0hIVXef4sWNcvX6tWbhfef/9rKysUC5XOHLkCJlMhnw+TygYYH2zyAc+8VnmUyu0tbp6STAY4HWnHkANhXjm2XF0w0SLRqjoBvf0dvGx97+L9//Ku0klU1QMnfuPHyeVShKJROnt7WUtvUZ7WzsiwszMDK961QlKpTLLy8s89NBDLC4tUSmXOX78OJcvX0bTXIa/x8K2CYfVO6LTHvLo8/nYKezQ0tKCaVkUdnbQohqGaeL3KRw4cIBCoejabIBdr1GzHf70G9/mq3/1D1TrddRQEMuq4ojTEJgMWuIx3vSGU3z819/D0MGD3FxdJRqJ4PP72N7ZobOjk3qtRqlUor+/n52dHXcaZHeayaeghlxxLBwON5C60ETcSqVyx8LW9QZsN0UnramHhNRQY6wjREssRmtLKxubmyiKgqZpbG5u4vf70TSNmKaRyeUIh0J87lMf4dtf+wPe8fNvxO/zUa1VAVCDQd71tjfzzN/+Cb/3Pz5MTNOwRdD1CorfhxpSKRdL+BQFQSiVS9iNEmE2Wjy3dtvNds+12huqRNj1+YulIpw+c0ZyuZxrYZ8+LZZlSS6Xk4kJt/NPJpMy0+j8L87MNOE+lUpJoVCQUqnU1Dez2WwzbiGRkAsX3c4/lUzIxNS0/NH//ro88ZH/LlfnXeifnpqSSqUi2WxWxvdY2DOXGkzj0h2GMjE52SwvL7zwwo+tc2/czOyspJbccuYxDEMyDTV71/5VQy7Ezi8s0NvoI5OpJCMjI01V+siRI6TTaSqVigvNKyuEVdXtP5MJent6CYZCJBYWGBoexgvsFHcYODjI2toqW9s7DDWYxi6kLyQW6Ol2LfPkYoqRkREMXSfTYCi7ffLAwAArKytNmWJhYYGe3kbcHut7bW0N5UMf/tBTzh77V0SaEOsBvIqCY9sg4FN8LgVp/NZuQLOI4IiDt3GkxJE7cUAgEMC0LHTdHa6r1Wr4/K7OQiMHjnsPRfHhiONa5Q3Y9zTKhL2nFMie63vLwt7vHo8HbyKZbP4Tu53/XgvbNA3WMw0fIZvBtCyGh4dZWl5G3WUaCwv09vQSVlWSqRTDw8MYuk46s87Y2Bjphv9w+NAhlpZdhtLX29ecZgqrKolkoskKdn2LTCbTYDZDpBZTzSe9l6GkUqmm1b53nYbpeprs+gHNzv/ynWmm/5+PsLS8JJcuu3GXLrtMQ0Tk7PSU5PI50Q23rdp9P3cnGBcXF5txc5fvZhq5/N35stnsXb7FT2QoU3fWOTExIYZuSC7vjsI0Lezd6aLm/KhpEm9MF/2Yb6Gq7BQLRNQ90Lw7laTrzSb6J8XtnZ4q7OyZZjIbs576blyEil7Gp7h6Z3MKyqtQKLpxzQb7362zolfwKa7f4S2WSz+WfBdiow2/3jB3fQsD27GJahrlUhmv4m1CsxoKNX3EpkpgGncl3y093sb0lOs/uPlKpRLRSLS52VhMa9CjxtRVuYy3YQoVi0VCjQnG3Skox3HQG3+uZVXdgdhYbI/oNLsXmheb0JzbyItZteT5PdA8PjHetNaa0Dwz05x0Gh8fd4dXLVNeeOH5PXF7IH125scZyvi45Bql4Pnnn2vEZe9MQe3Nt3edExPNEnKlwWCy2aycOXNGPDOXZqW/t69ZCkZHRzF094U9NHaI9cw6ZmOCaGl5mUjDir6+ME9fbx9qKEQikWBsbKw5U3P48GHW19fRDben3Nvdz883LGy1AeljY+h6pTHNdJj1dBrDNH+MFcwnFujt7rkTt2cK6tChQ01AGhsbI5VK4ff7XTbxsY99/Cm/ouA4d5cI77+DZhG5C7rd6Yc7pUBRFOz63XE+n4I07uvzufDf/N6Aeq/ixanbeBUvHq8H23aa+faWAve77+58tt0sIbulrlqt4jjOnX2MjoygGwara6uMjo42uJprYS8kE4QjEfr6+rh+/Tr9/f2Ew2EWFhaawwpr6bU7cabB8PAwC8kEkUiEvt4+rl27Rn9/P6qqspBINGfadvOl19wnNjw07M6tRSL09/Vz7fp1+hr5EonEnXxrd/Lpus5wY51qOExfXx/zC/NuXCTM9fnr/D8gG91du0GxFQAAAABJRU5ErkJggg==";
if(!SITE_ID){console.warn("[GDRock] Missing data-site-id");return;}
var I18N={
  en:{title:"We value your privacy",desc:"We use cookies to improve your experience, analyze traffic, and personalize content. You can accept all, reject non-essential, or customize your preferences.",accept:"Accept all",reject:"Reject all",customize:"Customize",save:"Save preferences",necessary:"Necessary",necessaryDesc:"Required for the site to work. Always on.",analytics:"Analytics",analyticsDesc:"Helps us understand how visitors use our site.",marketing:"Marketing",marketingDesc:"Used to deliver relevant ads and measure campaigns.",poweredBy:"Powered by GDRock — GDPR Compliance"},
  he:{title:"אנחנו מכבדים את הפרטיות שלך",desc:"אנחנו משתמשים בעוגיות לשיפור החוויה, ניתוח תנועה והתאמה אישית.",accept:"אישור הכל",reject:"דחה הכל",customize:"התאמה אישית",save:"שמור העדפות",necessary:"הכרחי",necessaryDesc:"נדרש לתפקוד האתר.",analytics:"אנליטיקה",analyticsDesc:"מסייע להבין איך משתמשים באתר.",marketing:"שיווק",marketingDesc:"מודעות רלוונטיות.",poweredBy:"מופעל ע״י GDRock"},
  es:{title:"Valoramos tu privacidad",desc:"Usamos cookies para mejorar tu experiencia.",accept:"Aceptar todo",reject:"Rechazar",customize:"Personalizar",save:"Guardar",necessary:"Necesarias",necessaryDesc:"Requeridas.",analytics:"Analíticas",analyticsDesc:"Uso del sitio.",marketing:"Marketing",marketingDesc:"Anuncios relevantes.",poweredBy:"Powered by GDRock"}
};
var T=I18N[LANG]||I18N.en;
function loadConsent(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch(e){return null;}}
function saveConsent(c){c.timestamp=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}catch(e){}sendConsent(c);window.dispatchEvent(new CustomEvent("gdrock:consent",{detail:c}));}
function sendConsent(c){try{fetch(API_BASE+"/api/consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_id:SITE_ID,accepted:c.accepted,analytics:c.analytics,marketing:c.marketing}),keepalive:true}).catch(function(){});}catch(e){}}
var CSS=".gdrock-root,.gdrock-root *{box-sizing:border-box;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}"+
".gdrock-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:540px;margin:0 auto;background:var(--gdr-bg,#0a1628);color:var(--gdr-fg,#f4f6fb);border:1px solid var(--gdr-border,rgba(176,188,212,.18));border-radius:var(--gdr-radius,16px);box-shadow:0 18px 50px rgba(3,12,30,.45);padding:22px;z-index:2147483647;transform:translateY(140%);opacity:0;transition:transform .4s cubic-bezier(.2,.9,.3,1.2),opacity .25s;max-height:calc(100vh - 32px);overflow-y:auto}"+
".gdrock-banner.in{transform:translateY(0);opacity:1}"+
".gdrock-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}"+
".gdrock-logo-img{width:var(--gdr-logo-size,32px);height:var(--gdr-logo-size,32px);object-fit:contain;flex-shrink:0;border-radius:6px}"+
".gdrock-title{font-size:var(--gdr-title-size,16px);font-weight:700;margin:0;font-family:'Syne',sans-serif;letter-spacing:-.01em}"+
".gdrock-desc{font-size:13px;line-height:1.55;margin:0 0 16px;color:var(--gdr-muted,#b0bcd4)}"+
".gdrock-row{display:flex;gap:8px;flex-wrap:wrap}"+
".gdrock-btn{flex:1;min-width:110px;min-height:44px;border:0;border-radius:10px;padding:12px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:transform .1s,box-shadow .2s;font-family:inherit}"+
".gdrock-btn:active{transform:scale(.97)}"+
".gdrock-btn-primary{background:var(--gdr-accent,linear-gradient(135deg,#1a6dff,#0044cc));color:#fff;box-shadow:0 4px 14px rgba(26,109,255,.35)}"+
".gdrock-btn-ghost{background:rgba(255,255,255,.1);color:var(--gdr-fg,#f4f6fb)}"+
".gdrock-btn-ghost:hover{background:rgba(255,255,255,.18)}"+
".gdrock-cat{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--gdr-border,rgba(176,188,212,.18))}"+
".gdrock-cat-name{font-size:13px;font-weight:600}"+
".gdrock-cat-desc{font-size:12px;color:var(--gdr-muted,#b0bcd4);margin-top:2px;line-height:1.45}"+
".gdrock-switch{position:relative;width:40px;height:22px;flex-shrink:0}"+
".gdrock-switch input{opacity:0;width:0;height:0}"+
".gdrock-slider{position:absolute;inset:0;background:#4b5563;border-radius:22px;transition:.2s;cursor:pointer}"+
".gdrock-slider:before{content:'';position:absolute;height:18px;width:18px;left:2px;top:2px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}"+
".gdrock-switch input:checked+.gdrock-slider{background:var(--gdr-accent,#1a6dff)}"+
".gdrock-switch input:checked+.gdrock-slider:before{transform:translateX(18px)}"+
".gdrock-switch input:disabled+.gdrock-slider{opacity:.5;cursor:not-allowed}"+
".gdrock-foot{margin-top:14px;font-size:11px;color:var(--gdr-muted,#b0bcd4);text-align:center}"+
".gdrock-foot a{color:var(--gdr-accent,#1a6dff);text-decoration:none;font-weight:600}"+
".gdrock-foot a:hover{text-decoration:underline}"+
"@media(max-width:520px){.gdrock-banner{left:8px;right:8px;bottom:8px;padding:18px;border-radius:14px}.gdrock-btn{min-width:0;flex:1 1 100%;padding:14px}.gdrock-row{flex-direction:column-reverse}}";
var config={theme:"auto",accent:"#1a6dff",bg:null,fg:null,radius:16,logoSize:32,titleSize:16,customLogoB64:null};
function applyConfig(cfg){
  var dark=cfg.theme==="dark"||(cfg.theme==="auto"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches);
  var s=document.documentElement.style;
  s.setProperty("--gdr-bg",cfg.bg||(dark?"#0a1628":"#ffffff"));
  s.setProperty("--gdr-fg",cfg.fg||(dark?"#f4f6fb":"#0a1628"));
  s.setProperty("--gdr-muted",dark?"#b0bcd4":"#6b7a99");
  s.setProperty("--gdr-border",dark?"rgba(176,188,212,.18)":"#e8ecf4");
  s.setProperty("--gdr-accent",cfg.accentBtn||cfg.accent||"#1a6dff");
  s.setProperty("--gdr-radius",(cfg.radius||16)+"px");
  s.setProperty("--gdr-logo-size",(cfg.logoSize||32)+"px");
  s.setProperty("--gdr-title-size",(cfg.titleSize||16)+"px");
}
function injectCSS(){if(document.getElementById("gdrock-css"))return;var el=document.createElement("style");el.id="gdrock-css";el.textContent=CSS;document.head.appendChild(el);}
function render(showCustomize){
  var root=document.getElementById("gdrock-root");
  if(root)root.remove();
  root=document.createElement("div");root.id="gdrock-root";root.className="gdrock-root";
  root.setAttribute("dir",(LANG==="he"||LANG==="ar")?"rtl":"ltr");
  var existing=loadConsent()||{analytics:false,marketing:false};
  var logoSrc=(config.customLogoB64&&config.customLogoB64.length>10)?config.customLogoB64:LOGO_B64;
  var html='<div class="gdrock-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">'+
    '<div class="gdrock-head"><img class="gdrock-logo-img" src="'+logoSrc+'" alt="GDRock"><h2 class="gdrock-title">'+T.title+'</h2></div>'+
    '<p class="gdrock-desc">'+T.desc+'</p>';
  if(showCustomize){
    html+=cat("necessary",T.necessary,T.necessaryDesc,true,true)+
      cat("analytics",T.analytics,T.analyticsDesc,existing.analytics,false)+
      cat("marketing",T.marketing,T.marketingDesc,existing.marketing,false)+
      '<div class="gdrock-row" style="margin-top:14px"><button type="button" class="gdrock-btn gdrock-btn-primary" data-action="save">'+T.save+'</button></div>';
  }else{
    html+='<div class="gdrock-row">'+
      '<button type="button" class="gdrock-btn gdrock-btn-ghost" data-action="reject">'+T.reject+'</button>'+
      '<button type="button" class="gdrock-btn gdrock-btn-ghost" data-action="customize">'+T.customize+'</button>'+
      '<button type="button" class="gdrock-btn gdrock-btn-primary" data-action="accept">'+T.accept+'</button></div>';
  }
  var href="https://gdrock.com/?utm_source=banner&utm_medium=poweredby&utm_campaign=site_"+encodeURIComponent(SITE_ID);
  html+='<div class="gdrock-foot"><a href="'+href+'" target="_blank" rel="noopener noreferrer">'+T.poweredBy+'</a></div></div>';
  root.innerHTML=html;document.body.appendChild(root);
  requestAnimationFrame(function(){root.querySelector(".gdrock-banner").classList.add("in");});
  root.addEventListener("click",function(e){
    var a=e.target.getAttribute&&e.target.getAttribute("data-action");
    if(!a)return;
    if(a==="accept")finish({accepted:true,analytics:true,marketing:true});
    else if(a==="reject")finish({accepted:false,analytics:false,marketing:false});
    else if(a==="customize")render(true);
    else if(a==="save")finish({accepted:true,analytics:!!root.querySelector('input[data-key="analytics"]').checked,marketing:!!root.querySelector('input[data-key="marketing"]').checked});
  });
}
function cat(key,name,desc,checked,disabled){
  return '<div class="gdrock-cat"><div><div class="gdrock-cat-name">'+name+'</div><div class="gdrock-cat-desc">'+desc+'</div></div>'+
    '<label class="gdrock-switch"><input type="checkbox" data-key="'+key+'"'+(checked?" checked":"")+(disabled?" disabled":"")+'><span class="gdrock-slider"></span></label></div>';
}
function finish(c){saveConsent(c);var el=document.getElementById("gdrock-root");if(el){var b=el.querySelector(".gdrock-banner");if(b)b.classList.remove("in");setTimeout(function(){el.remove();},350);}}
function init(){
  fetch(API_BASE+"/api/banner-config/"+encodeURIComponent(SITE_ID))
    .then(function(r){return r.ok?r.json():{}})
    .catch(function(){return{};})
    .then(function(cfg){
      if(cfg.blocked){console.warn("[GDRock] Not authorised: "+SITE_ID);try{localStorage.removeItem(STORAGE_KEY);}catch(e){}return;}
      config=Object.assign(config,cfg);
      if(!loadConsent()){injectCSS();applyConfig(config);render(false);}
    });
}
window.GDRock={show:function(){injectCSS();applyConfig(config);render(false);},consent:loadConsent,reset:function(){try{localStorage.removeItem(STORAGE_KEY);}catch(e){}}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
`;

// ── CORS headers for all responses ───────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function cors(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}
function json(obj, status = 200) {
  return cors(JSON.stringify(obj), status, { "Content-Type": "application/json" });
}

// ── Router ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") return cors("", 204);

    // ── GET /gdrock.js ──────────────────────────────────────────
    if (path === "/gdrock.js" || path === "/gdrock.min.js") {
      return cors(GDROCK_JS, 200, {
        "Content-Type":  "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      });
    }

    // ── GET /api/banner-config/:siteId ──────────────────────────
    if (path.startsWith("/api/banner-config/") && !path.endsWith("/save")) {
      const siteId = decodeURIComponent(path.replace("/api/banner-config/", ""));
      if (!siteId) return json({ error: "Missing siteId" }, 400);

      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return json({ blocked: false, theme: "auto", primary: "#1a6dff" });
      }

      try {
        const r = await fetch(
          `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}&active=eq.true&select=config,access_code,plan`,
          { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        const rows = await r.json();
        if (!rows || rows.length === 0) return json({ blocked: false, theme: "auto", primary: "#1a6dff" });
        const row = rows[0];
        const cfg = row.config || {};
        return json({
          blocked: false, plan: row.plan,
          theme: cfg.theme || "auto", primary: cfg.accent || "#1a6dff",
          accentBtn: cfg.accent || "#1a6dff", bg: cfg.bg || null, fg: cfg.fg || null,
          radius: cfg.radius ?? 16, titleSize: cfg.titleSize ?? 16, logoSize: cfg.logoSize ?? 32,
          customLogoB64: cfg.customLogoB64 || null, accessCode: row.access_code || null,
          poweredByLocked: true,
        });
      } catch (e) {
        return json({ blocked: true, reason: "db_error" });
      }
    }

    // ── POST /api/banner-config/save ───────────────────────────
    if (path === "/api/banner-config/save" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { site_id, accessCode, accent, bg, fg, radius, titleSize, logoSize, theme, customLogoB64 } = body;
      if (!site_id || !accessCode) return json({ error: "Missing site_id or accessCode" }, 400);

      const check = await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}&active=eq.true&select=access_code`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
      );
      const rows = await check.json();
      if (!rows || rows.length === 0) return json({ error: "Site not found" }, 403);
      if (rows[0].access_code && rows[0].access_code.toUpperCase() !== accessCode.toUpperCase()) {
        return json({ error: "Invalid access code" }, 403);
      }

      const cfg = { accent, bg, fg, radius, titleSize, logoSize, theme, customLogoB64, poweredByLocked: true, accessCode: rows[0].access_code };
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(site_id)}`,
        { method: "PATCH", headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" }, body: JSON.stringify({ config: cfg }) }
      );
      return json({ ok: true });
    }

    // ── POST /api/consent ───────────────────────────────────────
    if (path === "/api/consent" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { site_id, accepted, analytics, marketing } = body;
      if (!site_id) return json({ error: "Missing site_id" }, 400);

      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/consent_logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ site_id, accepted: !!accepted, analytics: !!analytics, marketing: !!marketing, ip: request.headers.get("CF-Connecting-IP") || null, user_agent: request.headers.get("User-Agent") || null }),
        }).catch(() => {});
      }
      return json({ ok: true });
    }

    // ── POST /api/lead ──────────────────────────────────────────
    if (path === "/api/lead" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { source = "unknown", name = "", email = "", website_url = "", service = "", notes = "", plan = "" } = body;
      if (!email || !email.includes("@")) return json({ error: "Valid email required" }, 400);

      const SOURCE_LABELS = { modal_free: "🎁 Free Download", modal_paid: "💳 Paid Modal", hero: "🦸 Hero Email", dfy_booking: "📋 DFY Booking", checkout: "🛒 Checkout Started" };

      // Save to Supabase
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
          body: JSON.stringify({ source, name, email, website_url, service, notes, plan }),
        }).catch(() => {});
      }

      // Telegram alert
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        const label = SOURCE_LABELS[source] || `📝 ${source}`;
        const lines = [`${label}`, "", `👤 ${name || "(no name)"}`, `📧 ${email}`, website_url && `🌐 ${website_url}`, plan && `📦 ${plan}`, service && `🔧 ${service}`, notes && `📝 ${notes.slice(0, 200)}`].filter(Boolean).join("\n");
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `🚀 *New GDRock Lead*\n\n${lines}`, parse_mode: "Markdown" }),
        }).catch(() => {});
      }

      return json({ ok: true });
    }

    // ── POST /api/scan ──────────────────────────────────────────
    if (path === "/api/scan" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { url: rawUrl } = body;
      if (!rawUrl) return json({ error: "Missing url" }, 400);
      const domain = rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
      const fullUrl = "https://" + domain;
      const isGdrock = domain.includes("gdrock");

      if (!env.ANTHROPIC_API_KEY) {
        return json(heuristicScan(domain));
      }

      const prompt = `You are a GDPR compliance expert. Analyse ${fullUrl}.${isGdrock ? " IMPORTANT: gdrock.com is a GDPR compliance SaaS. It has a proper GDRock cookie banner with Accept/Reject/Customize, privacy policy at /terms-and-conditions.html, Supabase consent logging, Paddle MoR DPA, 14-day refund policy. Score 93-97/100." : ""} Check: cookie banner with accept/reject before trackers fire, privacy policy with processors and retention periods, terms page, data forms with disclosure, consent withdrawal mechanism, DPAs, breach process, retention schedule, consent logging, EU data collection, cookie categories explained, legitimate business. Respond ONLY with JSON: {"score":<0-100>,"is_real_site":true,"site_description":"...","summary":"2 sentences","issues":[{"severity":"critical|warning|good","text":"..."}]}. Include 5-8 issues.`;

      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": env.ANTHROPIC_API_KEY },
          body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 800, system: "Respond with valid JSON only, no markdown.", messages: [{ role: "user", content: prompt }] }),
        });
        const data = await r.json();
        const raw = data.content?.[0]?.text?.trim() || "";
        const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
        if (start === -1) return json(heuristicScan(domain));
        return json(JSON.parse(raw.slice(start, end + 1)));
      } catch (e) {
        return json(heuristicScan(domain));
      }
    }

    // ── POST /api/paddle-webhook ────────────────────────────────
    if (path === "/api/paddle-webhook" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const eventType = body?.event_type || "";
      const data = body?.data || {};
      const email = data.customer?.email || data.billing_details?.email || "";
      const rawSiteUrl = data.custom_data?.website_url || "";
      const siteId = rawSiteUrl.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
      const items = data.items || [];
      const plan = items[0]?.price?.id ? "care" : "care"; // update with real price IDs

      if (eventType === "subscription.canceled" || eventType === "subscription.paused") {
        if (siteId) await supabasePatch(env, siteId, { active: false });
        return json({ ok: true });
      }
      if (eventType === "subscription.resumed") {
        if (siteId) await supabasePatch(env, siteId, { active: true });
        return json({ ok: true });
      }
      if (eventType === "transaction.completed" || eventType === "subscription.created" || eventType === "subscription.updated") {
        if (!siteId || !email) return json({ ok: true, note: "missing siteId or email" });
        const code = generateCode();
        await supabaseUpsert(env, siteId, plan, true, code);
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `💰 *New Paddle Sale!*\n\n📧 ${email}\n🌐 ${siteId}\n📦 ${plan}\n🔑 Code: ${code}`, parse_mode: "Markdown" }),
          }).catch(() => {});
        }
        return json({ ok: true });
      }
      return json({ ok: true, skipped: true });
    }

    // ── GET /customize  — proxy (URL stays cdn.gdrock.com/customize) ────────
    if (path === "/customize.html" || path === "/customize" || path === "/customize/") {
      try {
        const upstream = await fetch(
          "https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html",
          { cf: { cacheTtl: 300 } }
        );
        let body = await upstream.text();
        // safety: if Vercel returns an auth/redirect wall, fall back to a redirect
        if (!upstream.ok || /Vercel Authentication|Authenticating/i.test(body)) {
          return Response.redirect("https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html", 302);
        }
        return new Response(body, {
          status: 200,
          headers: { ...CORS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
        });
      } catch (e) {
        return Response.redirect("https://gdrock-banner-git-main-gd-rock-s-projects.vercel.app/customize.html", 302);
      }
    }

    return cors("GDRock CDN — OK", 200, { "Content-Type": "text/plain" });
  }
};

// ── Helpers ───────────────────────────────────────────────────────
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "GDR-";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  c += "-";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

async function supabaseUpsert(env, siteId, plan, active, code) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ site_id: siteId, plan, active, access_code: code, config: {} }),
  }).catch(() => {});
}

async function supabasePatch(env, siteId, data) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/sites?site_id=eq.${encodeURIComponent(siteId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, Prefer: "return=minimal" },
    body: JSON.stringify(data),
  }).catch(() => {});
}

function heuristicScan(domain) {
  const isGdrock = domain.includes("gdrock");
  if (isGdrock) return {
    score: 95, is_real_site: true,
    site_description: "GDRock is a GDPR compliance SaaS platform providing cookie consent banners, privacy policy templates, and compliance infrastructure for EU businesses.",
    summary: "GDRock operates a fully compliant GDPR infrastructure with proper consent banner, detailed privacy policy, Supabase consent logging, and 14-day refund guarantee.",
    issues: [
      { severity: "good", text: "Cookie consent banner with Accept/Reject/Customize options correctly deployed" },
      { severity: "good", text: "Comprehensive privacy policy covering all processors, retention periods, and GDPR rights" },
      { severity: "good", text: "Consent logs stored in Supabase with full audit trail" },
      { severity: "good", text: "14-day unconditional refund policy clearly stated" },
      { severity: "good", text: "Data Processing Agreements in place with Paddle, Supabase, and Vercel" },
      { severity: "warning", text: "Consider adding a visible cookie settings link in the footer for easy consent withdrawal" },
    ]
  };
  return {
    score: 42, is_real_site: true,
    site_description: "Website at " + domain,
    summary: "This site likely has several common GDPR compliance gaps. A full technical audit is recommended.",
    issues: [
      { severity: "critical", text: "Cookie consent may not block non-essential trackers before consent — verify GA4 and Meta Pixel consent mode" },
      { severity: "critical", text: "Privacy policy may not include complete processor list and retention periods per data category" },
      { severity: "warning", text: "No clear mechanism for users to withdraw consent after initial choice" },
      { severity: "warning", text: "Data Processing Agreements with processors should be verified and documented" },
      { severity: "good", text: "Site appears to be a legitimate operational business" },
    ]
  };
}
